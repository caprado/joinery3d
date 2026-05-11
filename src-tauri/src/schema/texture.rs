use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::ids::TextureId;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Texture {
    pub id: TextureId,
    pub name: String,
    pub file: String,
    pub width: u32,
    pub height: u32,
    pub tags: Vec<String>,
}
