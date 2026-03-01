use reqwest::Client;

use super::error::MetaCompsError;
use super::types::MetaCompsResponse;

const META_COMPS_URL: &str =
    "https://raw.githubusercontent.com/GuiRCosta/tft/main/meta-comps.json";

pub struct MetaCompsClient {
    client: Client,
}

impl MetaCompsClient {
    pub fn new() -> Result<Self, MetaCompsError> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()?;
        Ok(Self { client })
    }

    pub async fn fetch_meta_comps(&self) -> Result<MetaCompsResponse, MetaCompsError> {
        let response: MetaCompsResponse =
            self.client.get(META_COMPS_URL).send().await?.json().await?;

        if response.compositions.is_empty() {
            return Err(MetaCompsError::EmptyCompositions);
        }

        Ok(response)
    }
}
