use serde::{Deserialize, Serialize};

pub const EVENT_DDRAGON_LOADED: &str = "ddragon:loaded";
pub const EVENT_DDRAGON_UPDATING: &str = "ddragon:updating";
pub const EVENT_DDRAGON_ERROR: &str = "ddragon:error";

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DdragonLoadedPayload {
    pub version: String,
    pub current_set: u8,
    pub champion_count: usize,
    pub item_count: usize,
    pub trait_count: usize,
    pub locale: String,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DdragonUpdatingPayload {
    pub from_version: Option<String>,
    pub to_version: String,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DdragonErrorPayload {
    pub message: String,
    pub recoverable: bool,
}
