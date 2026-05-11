import { describe, it, expect } from 'vitest'
import { isOk, isErr } from '../fp/result-ops'
import { validatePart } from './validate-part'

const validPart = {
  id: 'head_male_base',
  name: 'Male Head (Base)',
  tags: ['head'],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
  textureSlots: [{ channel: 'diffuse', defaultTextureId: 'skin_pale' }],
  thumbnailFile: null,
}

describe('validatePart', () => {
  it('accepts a valid part', () => {
    const result = validatePart(validPart, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.id.value).toBe('head_male_base')
      expect(result.value.tags).toHaveLength(1)
      expect(result.value.tags[0]?.value).toBe('head')
      expect(result.value.textureSlots[0]?.channel).toBe('diffuse')
    }
  })

  it('accepts a part with no thumbnail', () => {
    const result = validatePart({ ...validPart, thumbnailFile: null }, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) expect(result.value.thumbnailFile).toBeUndefined()
  })

  it('accepts a part with a thumbnail path', () => {
    const result = validatePart({ ...validPart, thumbnailFile: 'thumb.png' }, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) expect(result.value.thumbnailFile).toBe('thumb.png')
  })

  it('rejects non-object', () => {
    const result = validatePart(null, 'root')
    expect(isErr(result)).toBe(true)
  })

  it('rejects invalid tags', () => {
    const result = validatePart({ ...validPart, tags: [42] }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.tags[0]')
  })

  it('rejects invalid texture channel', () => {
    const bad = {
      ...validPart,
      textureSlots: [{ channel: 'glow', defaultTextureId: 'x' }],
    }
    const result = validatePart(bad, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.textureSlots[0].channel')
  })

  it('rejects invalid meshFile', () => {
    const result = validatePart({ ...validPart, meshFile: '' }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.meshFile')
  })

  it('rejects invalid defaultOffset', () => {
    const result = validatePart({ ...validPart, defaultOffset: 'bad' }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.defaultOffset')
  })
})
