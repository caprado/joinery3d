use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::ids::{PartId, SlotTag, TextureId};
use super::vec::Transform;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum TextureChannel {
    #[serde(rename = "diffuse")]
    Diffuse,
    #[serde(rename = "normal")]
    Normal,
    #[serde(rename = "specular")]
    Specular,
    #[serde(rename = "emissive")]
    Emissive,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct TextureSlot {
    pub channel: TextureChannel,
    #[serde(rename = "defaultTextureId")]
    pub default_texture_id: Option<TextureId>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Part {
    pub id: PartId,
    pub name: String,
    pub tags: Vec<SlotTag>,
    #[serde(rename = "meshFile")]
    pub mesh_file: String,
    #[serde(rename = "defaultOffset")]
    pub default_offset: Transform,
    #[serde(rename = "textureSlots")]
    pub texture_slots: Vec<TextureSlot>,
    #[serde(rename = "thumbnailFile")]
    pub thumbnail_file: Option<String>,
}
