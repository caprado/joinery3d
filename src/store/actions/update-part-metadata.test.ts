import { describe, it, expect } from 'vitest'
import { partId, slotTag } from '../../schema/ids'
import type { Part } from '../../schema/part'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import { buildIndexFromParts } from '../../core/library-index'
import { initialState } from '../state'
import type { AppState } from '../state'
import { updatePartMetadata } from './update-part-metadata'

const headTag = slotTag('head')
const headPartId = partId('head_male_base')

const headPart: Part = {
  id: headPartId,
  name: 'Male Head (Base)',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const library = buildIndexFromParts([], [headPart], [])
const stateWithLibrary: AppState = { ...initialState, library }

describe('updatePartMetadata', () => {
  it('updates the part name', () => {
    const result = updatePartMetadata(stateWithLibrary, headPartId, { name: 'Renamed Head' })
    expect(result.library.parts['head_male_base']?.name).toBe('Renamed Head')
  })

  it('updates the part tags', () => {
    const result = updatePartMetadata(stateWithLibrary, headPartId, { tags: ['torso'] })
    expect(result.library.parts['head_male_base']?.tags[0]?.value).toBe('torso')
  })

  it('rebuilds partsByTag when tags change', () => {
    const result = updatePartMetadata(stateWithLibrary, headPartId, { tags: ['torso'] })
    expect(result.library.partsByTag['head']).toBeUndefined()
    expect(result.library.partsByTag['torso']).toHaveLength(1)
    expect(result.library.partsByTag['torso']?.[0]?.value).toBe('head_male_base')
  })

  it('returns state unchanged for unknown part', () => {
    const result = updatePartMetadata(stateWithLibrary, partId('nonexistent'), { name: 'X' })
    expect(result).toBe(stateWithLibrary)
  })

  it('preserves other fields when updating name only', () => {
    const result = updatePartMetadata(stateWithLibrary, headPartId, { name: 'New Name' })
    const updated = result.library.parts['head_male_base']
    expect(updated?.meshFile).toBe('parts/head/head_male_base.glb')
    expect(updated?.tags[0]?.value).toBe('head')
    expect(updated?.defaultOffset).toStrictEqual(IDENTITY_TRANSFORM)
  })
})
