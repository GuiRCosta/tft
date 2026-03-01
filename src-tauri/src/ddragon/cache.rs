use std::path::PathBuf;

use tauri::Manager;

use super::error::DdragonError;
use super::types::{DdragonMeta, TftChampion, TftItem, TftTrait};

const DDRAGON_DIR: &str = "ddragon";

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CachedLocaleData {
    pub champions: Vec<TftChampion>,
    pub items: Vec<TftItem>,
    pub traits: Vec<TftTrait>,
}

fn cache_dir(app: &tauri::AppHandle, version: &str, locale: &str) -> Result<PathBuf, DdragonError> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| DdragonError::CacheError(e.to_string()))?;

    Ok(base.join(DDRAGON_DIR).join(version).join(locale))
}

fn meta_path(app: &tauri::AppHandle) -> Result<PathBuf, DdragonError> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| DdragonError::CacheError(e.to_string()))?;

    Ok(base.join(DDRAGON_DIR).join("meta.json"))
}

pub fn write_cache(
    app: &tauri::AppHandle,
    version: &str,
    locale: &str,
    data: &CachedLocaleData,
) -> Result<(), DdragonError> {
    let dir = cache_dir(app, version, locale)?;
    std::fs::create_dir_all(&dir)?;

    let path = dir.join("data.json");
    let json = serde_json::to_string(data)?;
    std::fs::write(&path, json)?;

    Ok(())
}

pub fn read_cache(
    app: &tauri::AppHandle,
    version: &str,
    locale: &str,
) -> Result<Option<CachedLocaleData>, DdragonError> {
    let dir = cache_dir(app, version, locale)?;
    let path = dir.join("data.json");

    if !path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&path)?;
    let data: CachedLocaleData = serde_json::from_str(&content)?;
    Ok(Some(data))
}

pub fn write_meta(app: &tauri::AppHandle, meta: &DdragonMeta) -> Result<(), DdragonError> {
    let path = meta_path(app)?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let json = serde_json::to_string(meta)?;
    std::fs::write(&path, json)?;

    Ok(())
}

pub fn read_meta(app: &tauri::AppHandle) -> Result<Option<DdragonMeta>, DdragonError> {
    let path = meta_path(app)?;

    if !path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&path)?;
    let meta: DdragonMeta = serde_json::from_str(&content)?;
    Ok(Some(meta))
}

pub fn cleanup_old_caches(app: &tauri::AppHandle, current_version: &str) -> Result<(), DdragonError> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| DdragonError::CacheError(e.to_string()))?;

    let ddragon_dir = base.join(DDRAGON_DIR);
    if !ddragon_dir.exists() {
        return Ok(());
    }

    for entry in std::fs::read_dir(&ddragon_dir)? {
        let entry = entry?;
        let name = entry.file_name().to_string_lossy().to_string();
        if entry.path().is_dir() && name != current_version {
            std::fs::remove_dir_all(entry.path()).ok();
        }
    }

    Ok(())
}
