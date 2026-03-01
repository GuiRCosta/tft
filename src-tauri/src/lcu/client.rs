use reqwest::Client;
use serde_json::Value;

use super::error::LcuError;
use super::events::TFT_QUEUE_IDS;

pub struct LcuRestClient {
    client: Client,
    base_url: String,
    auth_header: String,
}

impl LcuRestClient {
    pub fn new(port: u16, auth_header: String) -> Result<Self, LcuError> {
        let client = Client::builder()
            .danger_accept_invalid_certs(true)
            .no_proxy()
            .timeout(std::time::Duration::from_secs(10))
            .build()?;

        Ok(Self {
            client,
            base_url: format!("https://127.0.0.1:{}", port),
            auth_header,
        })
    }

    pub async fn get(&self, endpoint: &str) -> Result<Value, LcuError> {
        let url = format!("{}{}", self.base_url, endpoint);
        let response = self
            .client
            .get(&url)
            .header("Authorization", &self.auth_header)
            .header("Accept", "application/json")
            .send()
            .await?
            .json::<Value>()
            .await?;

        Ok(response)
    }

    pub async fn get_gameflow_phase(&self) -> Result<String, LcuError> {
        let value = self.get("/lol-gameflow/v1/gameflow-phase").await?;
        Ok(value.as_str().unwrap_or("None").to_string())
    }

    pub async fn get_current_summoner(&self) -> Result<Option<String>, LcuError> {
        let value = self.get("/lol-summoner/v1/current-summoner").await?;
        let name = value
            .get("gameName")
            .or_else(|| value.get("displayName"))
            .and_then(|v| v.as_str())
            .map(String::from);
        Ok(name)
    }

    pub async fn get_session(&self) -> Result<Value, LcuError> {
        self.get("/lol-gameflow/v1/session").await
    }

    pub async fn is_tft_lobby(&self) -> Result<(bool, Option<i32>), LcuError> {
        match self.get("/lol-lobby/v2/lobby").await {
            Ok(value) => {
                let queue_id = value
                    .pointer("/gameConfig/queueId")
                    .and_then(|v| v.as_i64())
                    .map(|v| v as i32);

                let is_tft = queue_id.map(|id| TFT_QUEUE_IDS.contains(&id)).unwrap_or(false);
                Ok((is_tft, queue_id))
            }
            Err(_) => Ok((false, None)),
        }
    }
}
