use super::client::DdragonClient;
use super::error::DdragonError;
use super::types::{
    DdragonChampionResponse, DdragonItemResponse, DdragonTraitResponse, TftChampion, TftItem,
    TftTrait,
};

pub fn detect_current_set(response: &DdragonChampionResponse) -> Result<u8, DdragonError> {
    response
        .data
        .keys()
        .filter_map(|id| parse_set_number(id))
        .max()
        .ok_or(DdragonError::NoActiveSetFound)
}

fn parse_set_number(id: &str) -> Option<u8> {
    if !id.starts_with("TFT") {
        return None;
    }
    let rest = &id[3..];
    let underscore_pos = rest.find('_')?;
    rest[..underscore_pos].parse::<u8>().ok()
}

pub fn filter_champions(
    response: &DdragonChampionResponse,
    current_set: u8,
    version: &str,
) -> Vec<TftChampion> {
    let prefix = format!("TFT{}_", current_set);

    let mut champions: Vec<TftChampion> = response
        .data
        .values()
        .filter(|champ| champ.id.starts_with(&prefix))
        .map(|champ| TftChampion {
            id: champ.id.clone(),
            name: champ.name.clone(),
            cost: champ.tier.unwrap_or(1),
            image_url: DdragonClient::champion_image_url(version, &champ.image.full),
            image_name: champ.image.full.clone(),
        })
        .collect();

    champions.sort_by(|a, b| a.cost.cmp(&b.cost).then(a.name.cmp(&b.name)));
    champions
}

pub fn filter_items(
    response: &DdragonItemResponse,
    current_set: u8,
    version: &str,
) -> Vec<TftItem> {
    let set_prefix = format!("TFT{}_", current_set);

    let mut items: Vec<TftItem> = response
        .data
        .values()
        .filter(|item| item.id.starts_with(&set_prefix) || item.id.starts_with("TFT_Item_"))
        .map(|item| TftItem {
            id: item.id.clone(),
            name: item.name.clone(),
            image_url: DdragonClient::item_image_url(version, &item.image.full),
            image_name: item.image.full.clone(),
        })
        .collect();

    items.sort_by(|a, b| a.name.cmp(&b.name));
    items
}

pub fn filter_traits(
    response: &DdragonTraitResponse,
    current_set: u8,
    version: &str,
) -> Vec<TftTrait> {
    let prefix = format!("TFT{}_", current_set);

    let mut traits: Vec<TftTrait> = response
        .data
        .values()
        .filter(|t| t.id.starts_with(&prefix))
        .map(|t| TftTrait {
            id: t.id.clone(),
            name: t.name.clone(),
            image_url: DdragonClient::trait_image_url(version, &t.image.full),
            image_name: t.image.full.clone(),
        })
        .collect();

    traits.sort_by(|a, b| a.name.cmp(&b.name));
    traits
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_parse_set_number() {
        assert_eq!(parse_set_number("TFT13_Jinx"), Some(13));
        assert_eq!(parse_set_number("TFT4_Ahri"), Some(4));
        assert_eq!(parse_set_number("TFTTutorial_Assassin"), None);
        assert_eq!(parse_set_number("NotATFTId"), None);
        assert_eq!(parse_set_number("TFT_Item_BFSword"), None);
    }

    #[test]
    fn test_detect_current_set() {
        let mut data = HashMap::new();
        data.insert("TFT12_Ahri".to_string(), make_raw_champ("TFT12_Ahri"));
        data.insert("TFT13_Jinx".to_string(), make_raw_champ("TFT13_Jinx"));
        data.insert("TFT4_Ashe".to_string(), make_raw_champ("TFT4_Ashe"));

        let response = DdragonChampionResponse {
            version: "16.4.1".to_string(),
            data,
        };

        assert_eq!(detect_current_set(&response).unwrap(), 13);
    }

    fn make_raw_champ(id: &str) -> super::super::types::RawChampion {
        super::super::types::RawChampion {
            id: id.to_string(),
            name: "Test".to_string(),
            tier: Some(1),
            image: super::super::types::DdragonImage {
                full: format!("{}.png", id),
                group: "tft-champion".to_string(),
            },
        }
    }
}
