import { describe, it, expect } from 'vitest'
import { partId, slotTag, templateId, textureId, assetInstanceId } from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { Template } from '../schema/template'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import type { Transform } from '../schema/transform'
import {
  setSlotPart,
  setSlotOffset,
  resetSlotOffset,
  setSlotTexture,
  resolvePairedSlot,
} from './slots'

const headTag = slotTag('head')
const leftArmTag = slotTag('left_arm')
const rightArmTag = slotTag('right_arm')

const testInstance: AssetInstance = {
  id: assetInstanceId('test_asset'),
  name: 'Test Asset',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: {
      partId: partId('head_male_base'),
      offset: IDENTITY_TRANSFORM,
      textures: { diffuse: textureId('skin_pale') },
    },
    torso: {
      partId: partId('torso_male_base'),
      offset: IDENTITY_TRANSFORM,
      textures: {},
    },
  },
}

const testTemplate: Template = {
  id: templateId('humanoid'),
  name: 'Humanoid',
  description: 'Biped',
  version: 1,
  slots: [
    {
      tag: headTag,
      name: 'Head',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: partId('head_male_base'),
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: leftArmTag,
      name: 'Left Arm',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: partId('arm_human_base'),
      pairedSlot: rightArmTag,
      required: true,
    },
    {
      tag: rightArmTag,
      name: 'Right Arm',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: partId('arm_human_base_r'),
      pairedSlot: leftArmTag,
      required: true,
    },
  ],
}

describe('setSlotPart', () => {
  it('replaces the part with an empty assignment', () => {
    const newId = partId('head_elf')
    const result = setSlotPart(testInstance, headTag, newId)
    expect(result.slots['head']?.partId.value).toBe('head_elf')
    expect(result.slots['head']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
    expect(result.slots['head']?.textures).toStrictEqual({})
  })

  it('does not mutate the original instance', () => {
    const original = testInstance.slots['head']?.partId.value
    setSlotPart(testInstance, headTag, partId('head_elf'))
    expect(testInstance.slots['head']?.partId.value).toBe(original)
  })

  it('preserves other slots', () => {
    const result = setSlotPart(testInstance, headTag, partId('head_elf'))
    expect(result.slots['torso']?.partId.value).toBe('torso_male_base')
  })

  it('adds a new slot if it did not exist', () => {
    const result = setSlotPart(testInstance, leftArmTag, partId('arm_human_base'))
    expect(result.slots['left_arm']?.partId.value).toBe('arm_human_base')
  })
})

describe('setSlotOffset', () => {
  const newOffset: Transform = {
    position: [0.1, 0.2, 0.3],
    rotation: [0, 0, 0],
    scale: 1,
  }

  it('updates the offset of an existing slot', () => {
    const result = setSlotOffset(testInstance, headTag, newOffset)
    expect(result.slots['head']?.offset).toStrictEqual(newOffset)
  })

  it('preserves partId and textures', () => {
    const result = setSlotOffset(testInstance, headTag, newOffset)
    expect(result.slots['head']?.partId.value).toBe('head_male_base')
    expect(result.slots['head']?.textures['diffuse']?.value).toBe('skin_pale')
  })

  it('does not mutate the original instance', () => {
    setSlotOffset(testInstance, headTag, newOffset)
    expect(testInstance.slots['head']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
  })

  it('returns the instance unchanged if the slot does not exist', () => {
    const result = setSlotOffset(testInstance, leftArmTag, newOffset)
    expect(result).toBe(testInstance)
  })
})

describe('resetSlotOffset', () => {
  const customOffset: Transform = {
    position: [1, 2, 3],
    rotation: [0.1, 0.2, 0.3],
    scale: 2,
  }

  const makeOffsetInstance = (): AssetInstance => {
    const headSlot = testInstance.slots['head']
    if (headSlot === undefined) throw new Error('test setup: head slot missing')
    return {
      ...testInstance,
      slots: {
        ...testInstance.slots,
        head: { ...headSlot, offset: customOffset },
      },
    }
  }

  it('sets the offset back to identity', () => {
    const withOffset = makeOffsetInstance()
    const result = resetSlotOffset(withOffset, headTag)
    expect(result.slots['head']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
  })

  it('does not mutate the original instance', () => {
    const withOffset = makeOffsetInstance()
    resetSlotOffset(withOffset, headTag)
    expect(withOffset.slots['head']?.offset.position).toStrictEqual([1, 2, 3])
  })

  it('returns the instance unchanged if the slot does not exist', () => {
    const result = resetSlotOffset(testInstance, leftArmTag)
    expect(result).toBe(testInstance)
  })
})

describe('setSlotTexture', () => {
  it('sets a texture on a channel', () => {
    const newTexture = textureId('skin_dark')
    const result = setSlotTexture(testInstance, headTag, 'diffuse', newTexture)
    expect(result.slots['head']?.textures['diffuse']?.value).toBe('skin_dark')
  })

  it('adds a new channel without disturbing existing ones', () => {
    const normalTexture = textureId('head_normal')
    const result = setSlotTexture(testInstance, headTag, 'normal', normalTexture)
    expect(result.slots['head']?.textures['normal']?.value).toBe('head_normal')
    expect(result.slots['head']?.textures['diffuse']?.value).toBe('skin_pale')
  })

  it('removes a texture when undefined is passed', () => {
    const result = setSlotTexture(testInstance, headTag, 'diffuse', undefined)
    expect(result.slots['head']?.textures['diffuse']).toBeUndefined()
  })

  it('does not mutate the original instance', () => {
    setSlotTexture(testInstance, headTag, 'diffuse', textureId('skin_dark'))
    expect(testInstance.slots['head']?.textures['diffuse']?.value).toBe('skin_pale')
  })

  it('returns the instance unchanged if the slot does not exist', () => {
    const result = setSlotTexture(testInstance, leftArmTag, 'diffuse', textureId('x'))
    expect(result).toBe(testInstance)
  })
})

describe('resolvePairedSlot', () => {
  it('returns the paired slot tag for a paired slot', () => {
    const paired = resolvePairedSlot(testTemplate, leftArmTag)
    expect(paired?.value).toBe('right_arm')
  })

  it('returns the reverse pairing', () => {
    const paired = resolvePairedSlot(testTemplate, rightArmTag)
    expect(paired?.value).toBe('left_arm')
  })

  it('returns undefined for a slot without a pair', () => {
    const paired = resolvePairedSlot(testTemplate, headTag)
    expect(paired).toBeUndefined()
  })

  it('returns undefined for an unknown slot', () => {
    const paired = resolvePairedSlot(testTemplate, slotTag('tail'))
    expect(paired).toBeUndefined()
  })
})
