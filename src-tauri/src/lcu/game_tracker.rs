use tauri::Emitter;

use super::client::LcuRestClient;
use super::events::{GameEndPayload, GameStartPayload, EVENT_GAME_END, EVENT_GAME_START};
use super::session;

pub struct GameTracker {
    active_game_id: Option<u64>,
    is_active: bool,
}

impl GameTracker {
    pub fn new() -> Self {
        Self {
            active_game_id: None,
            is_active: false,
        }
    }

    pub async fn handle_phase_change(
        &mut self,
        app: &tauri::AppHandle,
        phase: &str,
        is_tft: bool,
        rest_client: &LcuRestClient,
    ) {
        match (phase, is_tft) {
            ("InProgress" | "ChampSelect", true) => {
                self.on_game_start(app, rest_client).await;
            }
            ("EndOfGame", _) | ("WaitingForStats", _) | ("None", _) => {
                self.on_game_end(app);
            }
            _ => {}
        }
    }

    async fn on_game_start(&mut self, app: &tauri::AppHandle, client: &LcuRestClient) {
        if self.is_active {
            return;
        }
        self.is_active = true;

        let session_data = session::fetch_session(client).await.ok();
        let game_id = session_data.as_ref().and_then(|s| s.game_id);
        let queue_id = session_data.as_ref().and_then(|s| s.queue_id);
        self.active_game_id = game_id;

        app.emit(
            EVENT_GAME_START,
            &GameStartPayload { game_id, queue_id },
        )
        .ok();
    }

    fn on_game_end(&mut self, app: &tauri::AppHandle) {
        if !self.is_active {
            return;
        }

        let game_id = self.active_game_id.take();
        self.is_active = false;

        app.emit(EVENT_GAME_END, &GameEndPayload { game_id }).ok();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_tracker_is_inactive() {
        let tracker = GameTracker::new();
        assert!(!tracker.is_active);
        assert!(tracker.active_game_id.is_none());
    }
}
