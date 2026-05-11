import { describe, it, expect } from 'vitest'
import { isOk } from '../fp/result-ops'
import { validateTemplate } from './validate-template'
import { validatePart } from './validate-part'
import { validateTexture } from './validate-texture'
import { validateInstance } from './validate-instance'

describe('schema roundtrip: Rust-serialized JSON validates in TypeScript', () => {
  it('validates a template matching Rust serde output', () => {
    const rustJson = {
      id: 'humanoid',
      name: 'Humanoid',
      description: 'Basic biped with paired limbs',
      version: 1,
      slots: [
        {
          tag: 'head',
          name: 'Head',
          anchor: {
            position: [0, 1.6, 0],
            rotation: [0, 0, 0],
            scale: 1,
          },
          defaultPartId: 'head_male_base',
          pairedSlot: null,
          required: true,
        },
      ],
    }

    const result = validateTemplate(rustJson, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.id.value).toBe('humanoid')
      expect(result.value.name).toBe('Humanoid')
      expect(result.value.slots[0]?.tag.value).toBe('head')
      expect(result.value.slots[0]?.defaultPartId?.value).toBe('head_male_base')
    }
  })

  it('validates a part matching Rust serde output', () => {
    const rustJson = {
      id: 'head_male_base',
      name: 'Male Head (Base)',
      tags: ['head'],
      meshFile: 'parts/head/head_male_base.glb',
      defaultOffset: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
      },
      textureSlots: [
        {
          channel: 'diffuse',
          defaultTextureId: 'skin_pale',
        },
      ],
      thumbnailFile: null,
    }

    const result = validatePart(rustJson, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.id.value).toBe('head_male_base')
      expect(result.value.tags[0]?.value).toBe('head')
      expect(result.value.textureSlots[0]?.defaultTextureId?.value).toBe('skin_pale')
    }
  })

  it('validates a texture matching Rust serde output', () => {
    const rustJson = {
      id: 'skin_pale',
      name: 'Pale Skin',
      file: 'textures/skin_pale.png',
      width: 128,
      height: 128,
      tags: ['skin', 'human'],
    }

    const result = validateTexture(rustJson, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.id.value).toBe('skin_pale')
    }
  })

  it('validates an instance matching Rust serde output', () => {
    const rustJson = {
      id: 'elf_warrior_v1',
      name: 'Elf Warrior',
      templateId: 'humanoid',
      version: 1,
      slots: {
        head: {
          partId: 'head_elf',
          offset: {
            position: [0, 0.02, 0],
            rotation: [0, 0, 0],
            scale: 1,
          },
          textures: {
            diffuse: 'head_elf_pale',
          },
        },
      },
    }

    const result = validateInstance(rustJson, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.id.value).toBe('elf_warrior_v1')
      expect(result.value.templateId.value).toBe('humanoid')
      expect(result.value.slots['head']?.partId.value).toBe('head_elf')
    }
  })
})
