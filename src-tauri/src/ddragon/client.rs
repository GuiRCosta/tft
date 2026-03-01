use reqwest::Client;

use super::error::DdragonError;
use super::types::{DdragonChampionResponse, DdragonItemResponse, DdragonTraitResponse};

const BASE_URL: &str = "https://ddragon.leagueoflegends.com";
const VERSIONS_URL: &str = "https://ddragon.leagueoflegends.com/api/versions.json";

pub struct DdragonClient {
    client: Client,
}

impl DdragonClient {
    pub fn new() -> Result<Self, DdragonError> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()?;
        Ok(Self { client })
    }

    pub async fn fetch_latest_version(&self) -> Result<String, DdragonError> {
        let versions: Vec<String> = self.client.get(VERSIONS_URL).send().await?.json().await?;

        versions
            .into_iter()
            .next()
            .ok_or_else(|| DdragonError::VersionFetchError("Lista de versoes vazia".into()))
    }

    pub async fn fetch_champions(
        &self,
        version: &str,
        locale: &str,
    ) -> Result<DdragonChampionResponse, DdragonError> {
        let url = format!("{}/cdn/{}/data/{}/tft-champion.json", BASE_URL, version, locale);
        let response = self.client.get(&url).send().await?.json().await?;
        Ok(response)
    }

    pub async fn fetch_items(
        &self,
        version: &str,
        locale: &str,
    ) -> Result<DdragonItemResponse, DdragonError> {
        let url = format!("{}/cdn/{}/data/{}/tft-item.json", BASE_URL, version, locale);
        let response = self.client.get(&url).send().await?.json().await?;
        Ok(response)
    }

    pub async fn fetch_traits(
        &self,
        version: &str,
        locale: &str,
    ) -> Result<DdragonTraitResponse, DdragonError> {
        let url = format!("{}/cdn/{}/data/{}/tft-trait.json", BASE_URL, version, locale);
        let response = self.client.get(&url).send().await?.json().await?;
        Ok(response)
    }

    pub fn champion_image_url(version: &str, image_name: &str) -> String {
        format!("{}/cdn/{}/img/tft-champion/{}", BASE_URL, version, image_name)
    }

    pub fn item_image_url(version: &str, image_name: &str) -> String {
        format!("{}/cdn/{}/img/tft-item/{}", BASE_URL, version, image_name)
    }

    pub fn trait_image_url(version: &str, image_name: &str) -> String {
        format!("{}/cdn/{}/img/tft-trait/{}", BASE_URL, version, image_name)
    }
}
