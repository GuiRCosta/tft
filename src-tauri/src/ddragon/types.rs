use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// --- Tipos brutos do Data Dragon JSON ---

#[derive(Debug, Clone, Deserialize)]
pub struct DdragonChampionResponse {
    pub version: String,
    pub data: HashMap<String, RawChampion>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RawChampion {
    pub id: String,
    pub name: String,
    pub tier: Option<u8>,
    pub image: DdragonImage,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DdragonImage {
    pub full: String,
    pub group: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DdragonItemResponse {
    pub version: String,
    pub data: HashMap<String, RawItem>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RawItem {
    pub id: String,
    pub name: String,
    pub image: DdragonImage,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DdragonTraitResponse {
    pub version: String,
    pub data: HashMap<String, RawTrait>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RawTrait {
    pub id: String,
    pub name: String,
    pub image: DdragonImage,
}

// --- Tipos processados (enviados ao frontend) ---

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TftChampion {
    pub id: String,
    pub name: String,
    pub cost: u8,
    pub image_url: String,
    pub image_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TftItem {
    pub id: String,
    pub name: String,
    pub image_url: String,
    pub image_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TftTrait {
    pub id: String,
    pub name: String,
    pub image_url: String,
    pub image_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DdragonMeta {
    pub version: String,
    pub current_set: u8,
    pub last_updated: String,
}
