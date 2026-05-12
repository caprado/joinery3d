import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  assetInstanceId,
} from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { Template } from '../schema/template'
import type { Part } from '../schema/part'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import type { Transform } from '../schema/transform'
import { buildIndexFromParts } from '../core/library-index'
import { createAppStore } from './store'

const leftArmTag = slotTag('left_arm')
const rightArmTag = slotTag('right_arm')
const headTag = slotTag('head')
const leftArmPartId = partId('arm_left')
const rightArmPartId = partId('arm_right')
const headPartId = partId('head_male_base')

const humanoidTemplate: Template = {
  id: templateId('humanoid'),
  name: 'Humanoid',
  description: 'Biped',
  version: 1,
  slots: [
    {
      tag: headTag,
      name: 'Head',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: headPartId,
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: leftArmTag,
      name: 'Left Arm',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: leftArmPartId,
      pairedSlot: rightArmTag,
      required: true,
    },
    {
      tag: rightArmTag,
      name: 'Right Arm',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: rightArmPartId,
      pairedSlot: leftArmTag,
      required: true,
    },
  ],
}

const leftArmPart: Part = {
  id: leftArmPartId,
  name: 'Left Arm',
  tags: [leftArmTag],
  meshFile: 'parts/left_arm/arm.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const rightArmPart: Part = {
  id: rightArmPartId,
  name: 'Right Arm',
  tags: [rightArmTag],
  meshFile: 'parts/right_arm/arm.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const headPart: Part = {
  id: headPartId,
  name: 'Head',
  tags: [headTag],
  meshFile: 'parts/head/head.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const library = buildIndexFromParts(
  [humanoidTemplate],
  [leftArmPart, rightArmPart, headPart],
  [],
)

const testInstance: AssetInstance = {
  id: assetInstanceId('test'),
  name: 'Test',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    left_arm: { partId: leftArmPartId, offset: IDENTITY_TRANSFORM, textures: {} },
    right_arm: { partId: rightArmPartId, offset: IDENTITY_TRANSFORM, textures: {} },
    head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: {} },
  },
}

describe('mirror to opposite slot', () => {
  it('does not mirror when mirrorEnabled is false', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, '/lib')
    store.getState().instanceCreated(testInstance)

    const offset: Transform = { position: [0.5, 0, 0], rotation: [0, 0.1, 0.2], scale: 1 }
    store.getState().setSlotOffset(leftArmTag, offset)

    expect(store.getState().currentInstance?.slots['left_arm']?.offset.position).toStrictEqual([0.5, 0, 0])
    expect(store.getState().currentInstance?.slots['right_arm']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
  })

  it('mirrors X position and Y/Z rotation to paired slot when enabled', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, '/lib')
    store.getState().instanceCreated(testInstance)
    store.getState().setEditorOption({ mirrorEnabled: true })

    const offset: Transform = { position: [0.5, 0.1, 0.2], rotation: [0.1, 0.2, 0.3], scale: 1 }
    store.getState().setSlotOffset(leftArmTag, offset)

    const rightOffset = store.getState().currentInstance?.slots['right_arm']?.offset
    expect(rightOffset?.position[0]).toBeCloseTo(-0.5)
    expect(rightOffset?.position[1]).toBeCloseTo(0.1)
    expect(rightOffset?.position[2]).toBeCloseTo(0.2)
    expect(rightOffset?.rotation[0]).toBeCloseTo(0.1)
    expect(rightOffset?.rotation[1]).toBeCloseTo(-0.2)
    expect(rightOffset?.rotation[2]).toBeCloseTo(-0.3)
  })

  it('does not mirror when the slot has no paired slot', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, '/lib')
    store.getState().instanceCreated(testInstance)
    store.getState().setEditorOption({ mirrorEnabled: true })

    const offset: Transform = { position: [1, 2, 3], rotation: [0, 0, 0], scale: 1 }
    store.getState().setSlotOffset(headTag, offset)

    // Head has no paired slot, so only head is updated
    expect(store.getState().currentInstance?.slots['head']?.offset.position).toStrictEqual([1, 2, 3])
  })

  it('disabling mirror stops mirroring', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, '/lib')
    store.getState().instanceCreated(testInstance)
    store.getState().setEditorOption({ mirrorEnabled: true })

    const offset1: Transform = { position: [0.5, 0, 0], rotation: [0, 0, 0], scale: 1 }
    store.getState().setSlotOffset(leftArmTag, offset1)

    store.getState().setEditorOption({ mirrorEnabled: false })

    const offset2: Transform = { position: [1, 0, 0], rotation: [0, 0, 0], scale: 1 }
    store.getState().setSlotOffset(leftArmTag, offset2)

    // Right arm should still have the first mirrored value, not the second
    expect(store.getState().currentInstance?.slots['right_arm']?.offset.position[0]).toBeCloseTo(-0.5)
    expect(store.getState().currentInstance?.slots['left_arm']?.offset.position[0]).toBeCloseTo(1)
  })
})
