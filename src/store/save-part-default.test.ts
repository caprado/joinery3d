import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  assetInstanceId,
} from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { Part } from '../schema/part'
import type { Template } from '../schema/template'
import type { Transform } from '../schema/transform'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { buildIndexFromParts } from '../core/library-index'
import { createInstanceFromTemplate } from '../core/create-instance'
import { buildRenderDescription } from '../core/assembly'
import { createAppStore } from './store'

const headTag = slotTag('head')
const headPartId = partId('head_male_base')

const headPart: Part = {
  id: headPartId,
  name: 'Male Head',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const humanoidTemplate: Template = {
  id: templateId('humanoid'),
  name: 'Humanoid',
  description: 'Biped',
  version: 1,
  slots: [
    {
      tag: headTag,
      name: 'Head',
      anchor: { position: [0, 1.6, 0], rotation: [0, 0, 0], scale: 1 },
      defaultPartId: headPartId,
      pairedSlot: undefined,
      required: true,
    },
  ],
}

const library = buildIndexFromParts([humanoidTemplate], [headPart], [])

describe('Save as part default', () => {
  it('promotes current offset into library part defaultOffset', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, '/lib')

    const instance: AssetInstance = {
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: {} },
      },
    }
    store.getState().instanceCreated(instance)

    const newOffset: Transform = { position: [0, 0.05, 0], rotation: [0, 0, 0], scale: 1 }
    store.getState().savePartDefaultOffset(headPartId, newOffset)

    const updatedPart = store.getState().library.parts['head_male_base']
    expect(updatedPart?.defaultOffset).toStrictEqual(newOffset)
  })

  it('future instances use the promoted offset in render description', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, '/lib')

    const newOffset: Transform = { position: [0, 0.05, 0], rotation: [0, 0, 0], scale: 1 }
    store.getState().savePartDefaultOffset(headPartId, newOffset)

    const newInstance = createInstanceFromTemplate(humanoidTemplate, 'New Asset')
    const state = store.getState()
    const renderDesc = buildRenderDescription(newInstance, humanoidTemplate, state.library)

    const headNode = renderDesc.nodes.find((node) => node.slotTag.value === 'head')
    // anchor [0, 1.6, 0] + updated part default [0, 0.05, 0] + identity instance offset
    expect(headNode?.worldTransform.position[1]).toBeCloseTo(1.65)
  })
})
