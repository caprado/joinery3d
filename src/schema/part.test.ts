import { describe, it, expect } from 'vitest'
import { partId, slotTag, textureId } from './ids'
import { partAcceptsTag } from './part'
import type { Part } from './part'
import { IDENTITY_TRANSFORM } from './transform'

const testPart: Part = {
  id: partId('head_male_base'),
  name: 'Male Head (Base)',
  tags: [slotTag('head')],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: textureId('skin_pale'), variants: [] }],
  thumbnailFile: undefined,
}

describe('partAcceptsTag', () => {
  it('returns true when the part has the given tag', () => {
    expect(partAcceptsTag(testPart, slotTag('head'))).toBe(true)
  })

  it('returns false when the part does not have the given tag', () => {
    expect(partAcceptsTag(testPart, slotTag('torso'))).toBe(false)
  })
})
