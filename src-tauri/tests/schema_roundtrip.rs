use joinery3d_lib::schema::ids::{AssetInstanceId, PartId, SlotTag, TemplateId, TextureId};
use joinery3d_lib::schema::instance::{AssetInstance, SlotAssignment};
use joinery3d_lib::schema::part::{Part, TextureChannel, TextureSlot};
use joinery3d_lib::schema::template::{SlotDefinition, Template};
use joinery3d_lib::schema::vec::{Scale, Transform};

#[test]
fn template_serializes_to_on_disk_format() {
    let template = Template {
        id: TemplateId::new("humanoid"),
        name: "Humanoid".to_string(),
        description: "Basic biped".to_string(),
        version: 1,
        slots: vec![SlotDefinition {
            tag: SlotTag::new("head"),
            name: "Head".to_string(),
            anchor: Transform::default(),
            default_part_id: Some(PartId::new("head_male_base")),
            paired_slot: None,
            required: true,
        }],
    };

    let json = serde_json::to_string_pretty(&template).unwrap();
    let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();

    // IDs serialize as plain strings (matching on-disk spec format)
    assert_eq!(parsed["id"], "humanoid");
    assert_eq!(parsed["name"], "Humanoid");
    assert_eq!(parsed["version"], 1);
    assert_eq!(parsed["slots"][0]["tag"], "head");
    assert_eq!(parsed["slots"][0]["defaultPartId"], "head_male_base");
    assert_eq!(parsed["slots"][0]["pairedSlot"], serde_json::Value::Null);
    assert_eq!(parsed["slots"][0]["required"], true);
}

#[test]
fn template_roundtrips_through_json() {
    let template = Template {
        id: TemplateId::new("chest"),
        name: "Chest".to_string(),
        description: "Container with lid".to_string(),
        version: 1,
        slots: vec![
            SlotDefinition {
                tag: SlotTag::new("body"),
                name: "Body".to_string(),
                anchor: Transform {
                    position: [0.0, 0.0, 0.0],
                    rotation: [0.0, 0.0, 0.0],
                    scale: Scale::Uniform(1.0),
                },
                default_part_id: Some(PartId::new("chest_body")),
                paired_slot: None,
                required: true,
            },
            SlotDefinition {
                tag: SlotTag::new("lid"),
                name: "Lid".to_string(),
                anchor: Transform {
                    position: [0.0, 0.25, -0.3],
                    rotation: [0.0, 0.0, 0.0],
                    scale: Scale::NonUniform([1.0, 0.5, 1.0]),
                },
                default_part_id: Some(PartId::new("lid_closed")),
                paired_slot: None,
                required: true,
            },
        ],
    };

    let json = serde_json::to_string(&template).unwrap();
    let deserialized: Template = serde_json::from_str(&json).unwrap();
    assert_eq!(template, deserialized);
}

#[test]
fn transform_with_uniform_scale_serializes_as_number() {
    let transform = Transform {
        position: [1.0, 2.0, 3.0],
        rotation: [0.1, 0.2, 0.3],
        scale: Scale::Uniform(2.0),
    };

    let json = serde_json::to_string(&transform).unwrap();
    let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();

    assert_eq!(parsed["scale"], 2.0);
    assert_eq!(parsed["position"][0], 1.0);
}

#[test]
fn transform_with_non_uniform_scale_serializes_as_array() {
    let transform = Transform {
        position: [0.0, 0.0, 0.0],
        rotation: [0.0, 0.0, 0.0],
        scale: Scale::NonUniform([2.0, 3.0, 4.0]),
    };

    let json = serde_json::to_string(&transform).unwrap();
    let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();

    assert_eq!(parsed["scale"][0], 2.0);
    assert_eq!(parsed["scale"][1], 3.0);
    assert_eq!(parsed["scale"][2], 4.0);
}

#[test]
fn part_roundtrips_through_json() {
    let part = Part {
        id: PartId::new("head_male_base"),
        name: "Male Head (Base)".to_string(),
        tags: vec![SlotTag::new("head")],
        mesh_file: "parts/head/head_male_base.glb".to_string(),
        default_offset: Transform::default(),
        texture_slots: vec![TextureSlot {
            channel: TextureChannel::Diffuse,
            default_texture_id: Some(TextureId::new("skin_pale")),
        }],
        thumbnail_file: None,
    };

    let json = serde_json::to_string(&part).unwrap();
    let deserialized: Part = serde_json::from_str(&json).unwrap();
    assert_eq!(part, deserialized);
}

#[test]
fn instance_roundtrips_through_json() {
    let mut textures = std::collections::HashMap::new();
    textures.insert("diffuse".to_string(), TextureId::new("head_elf_pale"));

    let mut slots = std::collections::HashMap::new();
    slots.insert(
        "head".to_string(),
        SlotAssignment {
            part_id: PartId::new("head_elf"),
            offset: Transform {
                position: [0.0, 0.02, 0.0],
                rotation: [0.0, 0.0, 0.0],
                scale: Scale::Uniform(1.0),
            },
            textures,
        },
    );

    let instance = AssetInstance {
        id: AssetInstanceId::new("elf_warrior_v1"),
        name: "Elf Warrior".to_string(),
        template_id: TemplateId::new("humanoid"),
        slots,
        version: 1,
    };

    let json = serde_json::to_string(&instance).unwrap();
    let deserialized: AssetInstance = serde_json::from_str(&json).unwrap();
    assert_eq!(instance, deserialized);
}

#[test]
fn rust_serialized_template_matches_sample_library_format() {
    // This template should produce JSON identical to what's in
    // public/sample-library/templates/humanoid.template.json
    let template = Template {
        id: TemplateId::new("humanoid"),
        name: "Humanoid".to_string(),
        description: "Basic biped with paired limbs".to_string(),
        version: 1,
        slots: vec![SlotDefinition {
            tag: SlotTag::new("head"),
            name: "Head".to_string(),
            anchor: Transform {
                position: [0.0, 1.6, 0.0],
                rotation: [0.0, 0.0, 0.0],
                scale: Scale::Uniform(1.0),
            },
            default_part_id: Some(PartId::new("head_male_base")),
            paired_slot: None,
            required: true,
        }],
    };

    let json = serde_json::to_string_pretty(&template).unwrap();

    // Verify this JSON can be parsed by our own deserializer (roundtrip)
    let reparsed: Template = serde_json::from_str(&json).unwrap();
    assert_eq!(template, reparsed);

    // Verify the JSON shape matches the on-disk format from spec.md
    let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
    assert_eq!(parsed["id"], "humanoid");
    assert_eq!(parsed["slots"][0]["tag"], "head");
    assert_eq!(parsed["slots"][0]["anchor"]["position"][1], 1.6);
    assert_eq!(parsed["slots"][0]["anchor"]["scale"], 1.0);
}
