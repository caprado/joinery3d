use serde::{Deserialize, Deserializer, Serialize, Serializer};
use ts_rs::TS;

macro_rules! define_id {
    ($name:ident) => {
        #[derive(Debug, Clone, PartialEq, TS)]
        #[ts(export, type = "string")]
        pub struct $name {
            pub value: String,
        }

        impl Serialize for $name {
            fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
                serializer.serialize_str(&self.value)
            }
        }

        impl<'de> Deserialize<'de> for $name {
            fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
                let value = String::deserialize(deserializer)?;
                Ok(Self { value })
            }
        }

        impl $name {
            pub fn new(value: &str) -> Self {
                Self {
                    value: value.to_string(),
                }
            }
        }
    };
}

define_id!(PartId);
define_id!(SlotTag);
define_id!(TextureId);
define_id!(TemplateId);
define_id!(AssetInstanceId);
