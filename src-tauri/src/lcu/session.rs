use serde_json::Value;

use super::client::LcuRestClient;
use super::error::LcuError;
use super::events::{GameSessionPayload, TFT_QUEUE_IDS};

pub fn parse_session(value: &Value) -> GameSessionPayload {
    let game_id = value
        .pointer("/gameData/gameId")
        .and_then(|v| v.as_u64());

    let queue_id = value
        .pointer("/gameData/queue/id")
        .and_then(|v| v.as_i64())
        .map(|v| v as i32);

    let game_start_time = value
        .pointer("/gameData/gameStartTime")
        .and_then(|v| v.as_u64());

    let is_tft = queue_id
        .map(|id| TFT_QUEUE_IDS.contains(&id))
        .unwrap_or(false);

    GameSessionPayload {
        game_id,
        queue_id,
        game_start_time,
        is_tft,
    }
}

pub async fn fetch_session(client: &LcuRestClient) -> Result<GameSessionPayload, LcuError> {
    let value = client.get_session().await?;
    Ok(parse_session(&value))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_parse_session_valid() {
        let json = json!({
            "gameData": {
                "gameId": 12345678,
                "queue": { "id": 1100 },
                "gameStartTime": 1700000000000u64,
            }
        });

        let result = parse_session(&json);
        assert_eq!(result.game_id, Some(12345678));
        assert_eq!(result.queue_id, Some(1100));
        assert_eq!(result.game_start_time, Some(1700000000000));
        assert!(result.is_tft);
    }

    #[test]
    fn test_parse_session_non_tft() {
        let json = json!({
            "gameData": {
                "gameId": 99999,
                "queue": { "id": 420 },
                "gameStartTime": 1700000000000u64,
            }
        });

        let result = parse_session(&json);
        assert_eq!(result.queue_id, Some(420));
        assert!(!result.is_tft);
    }

    #[test]
    fn test_parse_session_missing_fields() {
        let json = json!({});
        let result = parse_session(&json);
        assert_eq!(result.game_id, None);
        assert_eq!(result.queue_id, None);
        assert_eq!(result.game_start_time, None);
        assert!(!result.is_tft);
    }

    #[test]
    fn test_parse_session_all_tft_queue_ids() {
        for queue_id in &[1090, 1100, 1130, 1160] {
            let json = json!({
                "gameData": {
                    "gameId": 1,
                    "queue": { "id": queue_id },
                }
            });
            let result = parse_session(&json);
            assert!(result.is_tft, "queue_id {} should be TFT", queue_id);
        }
    }

    #[test]
    fn test_parse_session_partial_game_data() {
        let json = json!({
            "gameData": {
                "gameId": 42,
            }
        });
        let result = parse_session(&json);
        assert_eq!(result.game_id, Some(42));
        assert_eq!(result.queue_id, None);
        assert!(!result.is_tft);
    }

    #[test]
    fn test_parse_session_null_values() {
        let json = json!({
            "gameData": {
                "gameId": null,
                "queue": { "id": null },
                "gameStartTime": null,
            }
        });
        let result = parse_session(&json);
        assert_eq!(result.game_id, None);
        assert_eq!(result.queue_id, None);
        assert_eq!(result.game_start_time, None);
    }
}
