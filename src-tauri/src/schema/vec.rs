use serde::{Deserialize, Serialize};
use ts_rs::TS;

pub type Vec3 = [f64; 3];
pub type EulerXYZ = [f64; 3];
pub type Quat = [f64; 4];

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(untagged)]
pub enum Scale {
    Uniform(f64),
    NonUniform([f64; 3]),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Transform {
    pub position: Vec3,
    pub rotation: EulerXYZ,
    pub scale: Scale,
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            position: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0],
            scale: Scale::Uniform(1.0),
        }
    }
}
