use std::path::PathBuf;

use tauri::Manager;

use super::error::MetaCompsError;
use super::types::{MetaCompsMeta, MetaCompsResponse};

const METACOMPS_DIR: &str = "metacomps";

fn cache_dir(app: &tauri::AppHandle) -> Result<PathBuf, MetaCompsError> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| MetaCompsError::CacheError(e.to_string()))?;

    Ok(base.join(METACOMPS_DIR))
}

fn data_path(app: &tauri::AppHandle) -> Result<PathBuf, MetaCompsError> {
    Ok(cache_dir(app)?.join("data.json"))
}

fn meta_path(app: &tauri::AppHandle) -> Result<PathBuf, MetaCompsError> {
    Ok(cache_dir(app)?.join("meta.json"))
}

pub fn write_data(app: &tauri::AppHandle, data: &MetaCompsResponse) -> Result<(), MetaCompsError> {
    let dir = cache_dir(app)?;
    std::fs::create_dir_all(&dir)?;

    let path = dir.join("data.json");
    let json = serde_json::to_string(data)?;
    std::fs::write(&path, json)?;

    Ok(())
}

pub fn read_data(app: &tauri::AppHandle) -> Result<Option<MetaCompsResponse>, MetaCompsError> {
    let path = data_path(app)?;

    if !path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&path)?;
    let data: MetaCompsResponse = serde_json::from_str(&content)?;
    Ok(Some(data))
}

pub fn write_meta(app: &tauri::AppHandle, meta: &MetaCompsMeta) -> Result<(), MetaCompsError> {
    let path = meta_path(app)?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let json = serde_json::to_string(meta)?;
    std::fs::write(&path, json)?;

    Ok(())
}

pub fn read_meta(app: &tauri::AppHandle) -> Result<Option<MetaCompsMeta>, MetaCompsError> {
    let path = meta_path(app)?;

    if !path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&path)?;
    let meta: MetaCompsMeta = serde_json::from_str(&content)?;
    Ok(Some(meta))
}
