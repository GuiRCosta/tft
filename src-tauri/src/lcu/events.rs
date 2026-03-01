use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionStatusPayload {
    pub status: String,
    pub summoner_name: Option<String>,
    pub port: Option<u16>,
}

impl Default for ConnectionStatusPayload {
    fn default() -> Self {
        Self {
            status: "disconnected".to_string(),
            summoner_name: None,
            port: None,
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameflowPayload {
    pub phase: String,
    pub is_tft: bool,
    pub queue_id: Option<i32>,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LcuErrorPayload {
    pub message: String,
    pub recoverable: bool,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameStartPayload {
    pub game_id: Option<u64>,
    pub queue_id: Option<i32>,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameEndPayload {
    pub game_id: Option<u64>,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameSessionPayload {
    pub game_id: Option<u64>,
    pub queue_id: Option<i32>,
    pub game_start_time: Option<u64>,
    pub is_tft: bool,
}

pub const EVENT_CONNECTION_STATUS: &str = "lcu:connection-status";
pub const EVENT_GAMEFLOW_UPDATE: &str = "lcu:gameflow-update";
pub const EVENT_GAME_START: &str = "lcu:game-start";
pub const EVENT_GAME_END: &str = "lcu:game-end";
pub const EVENT_ERROR: &str = "lcu:error";

pub const TFT_QUEUE_IDS: &[i32] = &[
    1090, // TFT Normal
    1100, // TFT Ranked
    1130, // TFT Hyper Roll
    1160, // TFT Double Up
];
