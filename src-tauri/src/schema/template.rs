use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::ids::{PartId, SlotTag, TemplateId};
use super::vec::Transform;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SlotDefinition {
    pub tag: SlotTag,
    pub name: String,
    pub anchor: Transform,
    #[serde(rename = "defaultPartId")]
    pub default_part_id: Option<PartId>,
    #[serde(rename = "pairedSlot")]
    pub paired_slot: Option<SlotTag>,
    pub required: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Template {
    pub id: TemplateId,
    pub name: String,
    pub description: String,
    pub slots: Vec<SlotDefinition>,
    pub version: u32,
}
