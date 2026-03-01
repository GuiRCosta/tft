use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use tauri::Emitter;
use tokio::sync::Mutex;

use super::cache::{self, CachedLocaleData};
use super::client::DdragonClient;
use super::error::DdragonError;
use super::events::{
    DdragonErrorPayload, DdragonLoadedPayload, DdragonUpdatingPayload, EVENT_DDRAGON_ERROR,
    EVENT_DDRAGON_LOADED, EVENT_DDRAGON_UPDATING,
};
use super::filter;
use super::types::DdragonMeta;

const SUPPORTED_LOCALES: &[&str] = &["pt_BR", "en_US"];
const UPDATE_CHECK_INTERVAL_SECS: u64 = 1800;

pub struct DdragonState {
    pub data: Arc<Mutex<HashMap<String, CachedLocaleData>>>,
    pub meta: Arc<Mutex<Option<DdragonMeta>>>,
}

impl Default for DdragonState {
    fn default() -> Self {
        Self {
            data: Arc::new(Mutex::new(HashMap::new())),
            meta: Arc::new(Mutex::new(None)),
        }
    }
}

pub async fn initialize(
    app: tauri::AppHandle,
    data: Arc<Mutex<HashMap<String, CachedLocaleData>>>,
    meta: Arc<Mutex<Option<DdragonMeta>>>,
) {
    let client = match DdragonClient::new() {
        Ok(c) => c,
        Err(err) => {
            emit_error(&app, &err.to_string(), true);
            return;
        }
    };

    let latest_version = match client.fetch_latest_version().await {
        Ok(v) => v,
        Err(err) => {
            try_load_from_disk(&app, &data, &meta).await;
            emit_error(&app, &err.to_string(), true);
            return;
        }
    };

    let cached_meta = cache::read_meta(&app).ok().flatten();
    if let Some(ref m) = cached_meta {
        if m.version == latest_version && try_load_from_disk(&app, &data, &meta).await {
            emit_loaded_for_all(&app, &data, &meta).await;
            return;
        }
    }

    let old_version = cached_meta.map(|m| m.version);
    emit_updating(&app, old_version, &latest_version);

    match fetch_and_cache_all(&app, &client, &latest_version, &data, &meta).await {
        Ok(()) => {
            cache::cleanup_old_caches(&app, &latest_version).ok();
            emit_loaded_for_all(&app, &data, &meta).await;
        }
        Err(err) => {
            emit_error(&app, &err.to_string(), true);
        }
    }
}

pub async fn update_check_loop(
    app: tauri::AppHandle,
    data: Arc<Mutex<HashMap<String, CachedLocaleData>>>,
    meta: Arc<Mutex<Option<DdragonMeta>>>,
) {
    let mut interval = tokio::time::interval(Duration::from_secs(UPDATE_CHECK_INTERVAL_SECS));
    interval.tick().await;

    loop {
        interval.tick().await;

        let client = match DdragonClient::new() {
            Ok(c) => c,
            Err(_) => continue,
        };

        let latest = match client.fetch_latest_version().await {
            Ok(v) => v,
            Err(_) => continue,
        };

        let needs_update = {
            let locked = meta.lock().await;
            locked.as_ref().map(|m| m.version != latest).unwrap_or(true)
        };

        if needs_update {
            initialize(app.clone(), data.clone(), meta.clone()).await;
        }
    }
}

async fn fetch_and_cache_all(
    app: &tauri::AppHandle,
    client: &DdragonClient,
    version: &str,
    data: &Arc<Mutex<HashMap<String, CachedLocaleData>>>,
    meta: &Arc<Mutex<Option<DdragonMeta>>>,
) -> Result<(), DdragonError> {
    let first_locale = SUPPORTED_LOCALES[0];
    let champ_response = client.fetch_champions(version, first_locale).await?;
    let current_set = filter::detect_current_set(&champ_response)?;

    for locale in SUPPORTED_LOCALES {
        let champions_resp = if *locale == first_locale {
            champ_response.clone()
        } else {
            client.fetch_champions(version, locale).await?
        };
        let items_resp = client.fetch_items(version, locale).await?;
        let traits_resp = client.fetch_traits(version, locale).await?;

        let cached = CachedLocaleData {
            champions: filter::filter_champions(&champions_resp, current_set, version),
            items: filter::filter_items(&items_resp, current_set, version),
            traits: filter::filter_traits(&traits_resp, current_set, version),
        };

        cache::write_cache(app, version, locale, &cached).ok();

        let mut locked = data.lock().await;
        locked.insert(locale.to_string(), cached);
    }

    let new_meta = DdragonMeta {
        version: version.to_string(),
        current_set,
        last_updated: chrono_now(),
    };
    cache::write_meta(app, &new_meta).ok();

    {
        let mut locked = meta.lock().await;
        *locked = Some(new_meta);
    }

    Ok(())
}

async fn try_load_from_disk(
    app: &tauri::AppHandle,
    data: &Arc<Mutex<HashMap<String, CachedLocaleData>>>,
    meta: &Arc<Mutex<Option<DdragonMeta>>>,
) -> bool {
    let cached_meta = match cache::read_meta(app).ok().flatten() {
        Some(m) => m,
        None => return false,
    };

    let mut all_loaded = true;
    for locale in SUPPORTED_LOCALES {
        match cache::read_cache(app, &cached_meta.version, locale) {
            Ok(Some(cached)) => {
                let mut locked = data.lock().await;
                locked.insert(locale.to_string(), cached);
            }
            _ => {
                all_loaded = false;
            }
        }
    }

    if all_loaded {
        let mut locked = meta.lock().await;
        *locked = Some(cached_meta);
    }

    all_loaded
}

async fn emit_loaded_for_all(
    app: &tauri::AppHandle,
    data: &Arc<Mutex<HashMap<String, CachedLocaleData>>>,
    meta: &Arc<Mutex<Option<DdragonMeta>>>,
) {
    let locked_meta = meta.lock().await;
    let locked_data = data.lock().await;

    if let Some(ref m) = *locked_meta {
        for (locale, cached) in locked_data.iter() {
            let payload = DdragonLoadedPayload {
                version: m.version.clone(),
                current_set: m.current_set,
                champion_count: cached.champions.len(),
                item_count: cached.items.len(),
                trait_count: cached.traits.len(),
                locale: locale.clone(),
            };
            app.emit(EVENT_DDRAGON_LOADED, &payload).ok();
        }
    }
}

fn emit_updating(app: &tauri::AppHandle, from_version: Option<String>, to_version: &str) {
    let payload = DdragonUpdatingPayload {
        from_version,
        to_version: to_version.to_string(),
    };
    app.emit(EVENT_DDRAGON_UPDATING, &payload).ok();
}

fn emit_error(app: &tauri::AppHandle, message: &str, recoverable: bool) {
    let payload = DdragonErrorPayload {
        message: message.to_string(),
        recoverable,
    };
    app.emit(EVENT_DDRAGON_ERROR, &payload).ok();
}

fn chrono_now() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format!("{}", now)
}
