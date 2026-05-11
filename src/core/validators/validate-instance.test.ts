import { describe, it, expect } from 'vitest'
import { isOk, isErr } from '../fp/result-ops'
import { validateInstance } from './validate-instance'

const validInstance = {
  id: 'elf_warrior_v1',
  name: 'Elf Warrior',
  templateId: 'humanoid',
  version: 1,
  slots: {
    head: {
      partId: 'head_elf',
      offset: { position: [0, 0.02, 0], rotation: [0, 0, 0], scale: 1 },
      textures: { diffuse: 'head_elf_pale' },
    },
  },
}

describe('validateInstance', () => {
  it('accepts a valid instance', () => {
    const result = validateInstance(validInstance, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.id.value).toBe('elf_warrior_v1')
      expect(result.value.templateId.value).toBe('humanoid')
      expect(result.value.slots['head']?.partId.value).toBe('head_elf')
      expect(result.value.slots['head']?.textures['diffuse']?.value).toBe('head_elf_pale')
    }
  })

  it('accepts an instance with empty slots', () => {
    const result = validateInstance({ ...validInstance, slots: {} }, 'root')
    expect(isOk(result)).toBe(true)
  })

  it('rejects non-object', () => {
    const result = validateInstance('bad', 'root')
    expect(isErr(result)).toBe(true)
  })

  it('rejects missing templateId', () => {
    const result = validateInstance({ ...validInstance, templateId: 42 }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.templateId')
  })

  it('rejects invalid slot assignment', () => {
    const result = validateInstance({ ...validInstance, slots: { head: 'bad' } }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.slots.head')
  })

  it('rejects invalid texture channel in slot', () => {
    const badSlots = {
      head: {
        partId: 'head_elf',
        offset: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
        textures: { glow: 'bad' },
      },
    }
    const result = validateInstance({ ...validInstance, slots: badSlots }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.slots.head.textures.glow')
  })

  it('rejects non-object slots', () => {
    const result = validateInstance({ ...validInstance, slots: 'bad' }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.slots')
  })

  it('rejects invalid version', () => {
    const result = validateInstance({ ...validInstance, version: -1 }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.version')
  })
})
