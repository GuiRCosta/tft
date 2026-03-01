use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetaCompsResponse {
    pub version: String,
    pub patch: String,
    pub compositions: Vec<RawMetaComp>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawMetaComp {
    pub name: String,
    pub champions: Vec<String>,
    pub core_items: HashMap<String, Vec<String>>,
    pub winrate: f64,
    pub avg_placement: f64,
    pub difficulty: String,
    pub contested: u32,
    pub tier: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetaCompsMeta {
    pub version: String,
    pub patch: String,
    pub last_updated: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deserialize_fallback_json() {
        let json = include_str!("../../data/meta-comps-fallback.json");
        let response: MetaCompsResponse = serde_json::from_str(json).unwrap();
        assert!(!response.compositions.is_empty());
        assert!(!response.version.is_empty());
        assert!(!response.patch.is_empty());
    }

    #[test]
    fn test_raw_meta_comp_fields() {
        let json = r#"{
            "name": "Test Comp",
            "champions": ["TFT13_Jinx", "TFT13_Vi"],
            "coreItems": { "TFT13_Jinx": ["TFT_Item_IE"] },
            "winrate": 55.0,
            "avgPlacement": 3.5,
            "difficulty": "medium",
            "contested": 20,
            "tier": "A"
        }"#;
        let comp: RawMetaComp = serde_json::from_str(json).unwrap();
        assert_eq!(comp.name, "Test Comp");
        assert_eq!(comp.champions.len(), 2);
        assert_eq!(comp.tier, "A");
        assert!((comp.winrate - 55.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_meta_comps_meta_roundtrip() {
        let meta = MetaCompsMeta {
            version: "2026-01-01".to_string(),
            patch: "14.5".to_string(),
            last_updated: "1700000000".to_string(),
        };
        let json = serde_json::to_string(&meta).unwrap();
        let deserialized: MetaCompsMeta = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.version, meta.version);
        assert_eq!(deserialized.patch, meta.patch);
    }
}
