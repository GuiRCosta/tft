use serde::{Deserialize, Serialize};

pub const EVENT_METACOMPS_LOADED: &str = "metacomps:loaded";
pub const EVENT_METACOMPS_ERROR: &str = "metacomps:error";

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetaCompsLoadedPayload {
    pub version: String,
    pub patch: String,
    pub comp_count: usize,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetaCompsErrorPayload {
    pub message: String,
    pub recoverable: bool,
}
