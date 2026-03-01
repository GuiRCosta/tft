use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::Connector;

use super::error::LcuError;

pub struct LcuWebSocket {
    write: futures_util::stream::SplitSink<
        tokio_tungstenite::WebSocketStream<
            tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
        >,
        Message,
    >,
    read: futures_util::stream::SplitStream<
        tokio_tungstenite::WebSocketStream<
            tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
        >,
    >,
}

/// Evento WAMP recebido do LCU (opcode 8)
#[derive(Debug)]
pub struct WampEvent {
    pub uri: String,
    pub data: serde_json::Value,
}

impl LcuWebSocket {
    pub async fn connect(port: u16, auth_header: &str) -> Result<Self, LcuError> {
        let tls_connector = native_tls::TlsConnector::builder()
            .danger_accept_invalid_certs(true)
            .build()
            .map_err(|e| LcuError::WebSocketError(e.to_string()))?;

        let connector = Connector::NativeTls(tls_connector);

        let url = format!("wss://127.0.0.1:{}", port);
        let request = http::Request::builder()
            .uri(&url)
            .header("Authorization", auth_header)
            .header("Sec-WebSocket-Key", tokio_tungstenite::tungstenite::handshake::client::generate_key())
            .header("Sec-WebSocket-Version", "13")
            .header("Connection", "Upgrade")
            .header("Upgrade", "websocket")
            .header("Host", format!("127.0.0.1:{}", port))
            .body(())
            .map_err(|e| LcuError::WebSocketError(e.to_string()))?;

        let (ws_stream, _) =
            tokio_tungstenite::connect_async_tls_with_config(request, None, false, Some(connector))
                .await
                .map_err(|e| LcuError::WebSocketError(e.to_string()))?;

        let (write, read) = ws_stream.split();

        Ok(Self { write, read })
    }

    /// Subscribe to WAMP event (opcode 5)
    pub async fn subscribe(&mut self, event: &str) -> Result<(), LcuError> {
        let msg = format!(r#"[5, "{}"]"#, event);
        self.write
            .send(Message::Text(msg.into()))
            .await
            .map_err(|e| LcuError::WebSocketError(e.to_string()))
    }

    /// Read next WAMP event (opcode 8)
    pub async fn next_event(&mut self) -> Option<WampEvent> {
        while let Some(msg) = self.read.next().await {
            match msg {
                Ok(Message::Text(text)) => {
                    if let Some(event) = parse_wamp_event(&text) {
                        return Some(event);
                    }
                }
                Ok(Message::Close(_)) => return None,
                Err(_) => return None,
                _ => continue,
            }
        }
        None
    }
}

fn parse_wamp_event(text: &str) -> Option<WampEvent> {
    let parsed: serde_json::Value = serde_json::from_str(text).ok()?;
    let arr = parsed.as_array()?;

    // WAMP opcode 8 = event: [8, "uri", data]
    let opcode = arr.first()?.as_u64()?;
    if opcode != 8 {
        return None;
    }

    let uri = arr.get(1)?.as_str()?.to_string();
    let data = arr.get(2).cloned().unwrap_or(serde_json::Value::Null);

    Some(WampEvent { uri, data })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_wamp_event_valid() {
        let msg = r#"[8, "OnJsonApiEvent_lol-gameflow_v1_gameflow-phase", {"data": "InProgress"}]"#;
        let event = parse_wamp_event(msg).unwrap();
        assert_eq!(event.uri, "OnJsonApiEvent_lol-gameflow_v1_gameflow-phase");
        assert_eq!(event.data["data"], "InProgress");
    }

    #[test]
    fn test_parse_wamp_event_subscribe_response() {
        // Opcode 5 (subscribe) should be ignored
        let msg = r#"[5, "some-event"]"#;
        assert!(parse_wamp_event(msg).is_none());
    }

    #[test]
    fn test_parse_wamp_event_invalid_json() {
        let msg = "not json";
        assert!(parse_wamp_event(msg).is_none());
    }
}
