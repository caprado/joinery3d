import { describe, it, expect } from 'vitest'
import { isOk, isErr } from '../fp/result-ops'
import { validateTemplate } from './validate-template'

const validSlot = {
  tag: 'head',
  name: 'Head',
  anchor: { position: [0, 1.6, 0], rotation: [0, 0, 0], scale: 1 },
  defaultPartId: 'head_male_base',
  pairedSlot: null,
  required: true,
}

const validTemplate = {
  id: 'humanoid',
  name: 'Humanoid',
  description: 'Basic biped',
  version: 1,
  slots: [validSlot],
}

describe('validateTemplate', () => {
  it('accepts a valid template', () => {
    const result = validateTemplate(validTemplate, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.id.value).toBe('humanoid')
      expect(result.value.name).toBe('Humanoid')
      expect(result.value.slots).toHaveLength(1)
      expect(result.value.slots[0]?.tag.value).toBe('head')
    }
  })

  it('accepts a slot with no defaultPartId and no pairedSlot', () => {
    const minimal = {
      ...validTemplate,
      slots: [{ ...validSlot, defaultPartId: null, pairedSlot: null }],
    }
    const result = validateTemplate(minimal, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.slots[0]?.defaultPartId).toBeUndefined()
      expect(result.value.slots[0]?.pairedSlot).toBeUndefined()
    }
  })

  it('rejects non-object', () => {
    const result = validateTemplate('bad', 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root')
  })

  it('rejects missing id', () => {
    const result = validateTemplate({ ...validTemplate, id: 42 }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.id')
  })

  it('rejects invalid version', () => {
    const result = validateTemplate({ ...validTemplate, version: 0 }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.version')
  })

  it('rejects non-array slots', () => {
    const result = validateTemplate({ ...validTemplate, slots: 'bad' }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.slots')
  })

  it('rejects invalid slot with indexed path', () => {
    const result = validateTemplate({ ...validTemplate, slots: [{ tag: 42 }] }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.slots[0].tag')
  })

  it('rejects slot with missing required field', () => {
    const badSlot = { ...validSlot, required: 'yes' }
    const result = validateTemplate({ ...validTemplate, slots: [badSlot] }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.slots[0].required')
  })
})
