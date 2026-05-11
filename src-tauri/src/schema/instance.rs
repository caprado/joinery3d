use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::ids::{AssetInstanceId, PartId, TemplateId, TextureId};
use super::vec::Transform;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SlotAssignment {
    #[serde(rename = "partId")]
    pub part_id: PartId,
    pub offset: Transform,
    pub textures: HashMap<String, TextureId>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct AssetInstance {
    pub id: AssetInstanceId,
    pub name: String,
    #[serde(rename = "templateId")]
    pub template_id: TemplateId,
    pub slots: HashMap<String, SlotAssignment>,
    pub version: u32,
}
