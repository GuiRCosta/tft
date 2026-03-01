use std::sync::Arc;
use std::time::Duration;

use tauri::Emitter;
use tokio::sync::Mutex;

use super::cache;
use super::client::MetaCompsClient;
use super::events::{
    MetaCompsErrorPayload, MetaCompsLoadedPayload, EVENT_METACOMPS_ERROR, EVENT_METACOMPS_LOADED,
};
use super::types::{MetaCompsMeta, MetaCompsResponse};

const FALLBACK_JSON: &str = include_str!("../../data/meta-comps-fallback.json");
const UPDATE_CHECK_INTERVAL_SECS: u64 = 1800;

pub struct MetaCompsState {
    pub data: Arc<Mutex<Option<MetaCompsResponse>>>,
    pub meta: Arc<Mutex<Option<MetaCompsMeta>>>,
}

impl Default for MetaCompsState {
    fn default() -> Self {
        Self {
            data: Arc::new(Mutex::new(None)),
            meta: Arc::new(Mutex::new(None)),
        }
    }
}

pub async fn initialize(
    app: tauri::AppHandle,
    data: Arc<Mutex<Option<MetaCompsResponse>>>,
    meta: Arc<Mutex<Option<MetaCompsMeta>>>,
) {
    // 1. Try remote fetch
    if let Ok(client) = MetaCompsClient::new() {
        if let Ok(response) = client.fetch_meta_comps().await {
            store_and_emit(&app, &data, &meta, response).await;
            return;
        }
    }

    // 2. Try disk cache
    if try_load_from_disk(&app, &data, &meta).await {
        let locked = data.lock().await;
        if let Some(ref resp) = *locked {
            emit_loaded(&app, resp);
        }
        return;
    }

    // 3. Use bundled fallback
    match load_fallback() {
        Ok(response) => {
            store_and_emit(&app, &data, &meta, response).await;
        }
        Err(err) => {
            emit_error(&app, &err.to_string(), false);
        }
    }
}

pub async fn update_check_loop(
    app: tauri::AppHandle,
    data: Arc<Mutex<Option<MetaCompsResponse>>>,
    meta: Arc<Mutex<Option<MetaCompsMeta>>>,
) {
    let mut interval = tokio::time::interval(Duration::from_secs(UPDATE_CHECK_INTERVAL_SECS));
    interval.tick().await;

    loop {
        interval.tick().await;

        let client = match MetaCompsClient::new() {
            Ok(c) => c,
            Err(_) => continue,
        };

        let response = match client.fetch_meta_comps().await {
            Ok(r) => r,
            Err(_) => continue,
        };

        let needs_update = {
            let locked = meta.lock().await;
            locked
                .as_ref()
                .map(|m| m.version != response.version)
                .unwrap_or(true)
        };

        if needs_update {
            store_and_emit(&app, &data, &meta, response).await;
        }
    }
}

async fn store_and_emit(
    app: &tauri::AppHandle,
    data: &Arc<Mutex<Option<MetaCompsResponse>>>,
    meta: &Arc<Mutex<Option<MetaCompsMeta>>>,
    response: MetaCompsResponse,
) {
    cache::write_data(app, &response).ok();

    let new_meta = MetaCompsMeta {
        version: response.version.clone(),
        patch: response.patch.clone(),
        last_updated: chrono_now(),
    };
    cache::write_meta(app, &new_meta).ok();

    emit_loaded(app, &response);

    {
        let mut locked = data.lock().await;
        *locked = Some(response);
    }
    {
        let mut locked = meta.lock().await;
        *locked = Some(new_meta);
    }
}

fn load_fallback() -> Result<MetaCompsResponse, super::error::MetaCompsError> {
    let response: MetaCompsResponse = serde_json::from_str(FALLBACK_JSON)?;
    if response.compositions.is_empty() {
        return Err(super::error::MetaCompsError::EmptyCompositions);
    }
    Ok(response)
}

async fn try_load_from_disk(
    app: &tauri::AppHandle,
    data: &Arc<Mutex<Option<MetaCompsResponse>>>,
    meta: &Arc<Mutex<Option<MetaCompsMeta>>>,
) -> bool {
    let cached_meta = match cache::read_meta(app).ok().flatten() {
        Some(m) => m,
        None => return false,
    };

    match cache::read_data(app) {
        Ok(Some(cached_data)) => {
            {
                let mut locked = data.lock().await;
                *locked = Some(cached_data);
            }
            {
                let mut locked = meta.lock().await;
                *locked = Some(cached_meta);
            }
            true
        }
        _ => false,
    }
}

fn emit_loaded(app: &tauri::AppHandle, response: &MetaCompsResponse) {
    let payload = MetaCompsLoadedPayload {
        version: response.version.clone(),
        patch: response.patch.clone(),
        comp_count: response.compositions.len(),
    };
    app.emit(EVENT_METACOMPS_LOADED, &payload).ok();
}

fn emit_error(app: &tauri::AppHandle, message: &str, recoverable: bool) {
    let payload = MetaCompsErrorPayload {
        message: message.to_string(),
        recoverable,
    };
    app.emit(EVENT_METACOMPS_ERROR, &payload).ok();
}

fn chrono_now() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format!("{}", now)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_fallback_succeeds() {
        let response = load_fallback().unwrap();
        assert_eq!(response.compositions.len(), 5);
        assert!(!response.version.is_empty());
    }

    #[test]
    fn test_fallback_comps_have_champions() {
        let response = load_fallback().unwrap();
        for comp in &response.compositions {
            assert!(!comp.champions.is_empty(), "Comp '{}' has no champions", comp.name);
            assert!(!comp.name.is_empty());
            assert!(!comp.tier.is_empty());
        }
    }

    #[test]
    fn test_fallback_tiers_are_valid() {
        let response = load_fallback().unwrap();
        let valid_tiers = ["S", "A", "B", "C", "D"];
        for comp in &response.compositions {
            assert!(
                valid_tiers.contains(&comp.tier.as_str()),
                "Invalid tier '{}' for comp '{}'",
                comp.tier,
                comp.name
            );
        }
    }
}
