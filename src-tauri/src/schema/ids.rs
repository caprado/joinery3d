use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(transparent)]
pub struct PartId {
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(transparent)]
pub struct SlotTag {
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(transparent)]
pub struct TextureId {
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(transparent)]
pub struct TemplateId {
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(transparent)]
pub struct AssetInstanceId {
    pub value: String,
}

impl PartId {
    pub fn new(value: &str) -> Self {
        Self {
            value: value.to_string(),
        }
    }
}

impl SlotTag {
    pub fn new(value: &str) -> Self {
        Self {
            value: value.to_string(),
        }
    }
}

impl TextureId {
    pub fn new(value: &str) -> Self {
        Self {
            value: value.to_string(),
        }
    }
}

impl TemplateId {
    pub fn new(value: &str) -> Self {
        Self {
            value: value.to_string(),
        }
    }
}

impl AssetInstanceId {
    pub fn new(value: &str) -> Self {
        Self {
            value: value.to_string(),
        }
    }
}
