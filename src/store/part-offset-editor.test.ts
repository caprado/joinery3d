import { describe, it, expect } from 'vitest'
import { partId, slotTag, templateId } from '../schema/ids'
import type { Part } from '../schema/part'
import type { Template } from '../schema/template'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import type { Transform } from '../schema/transform'
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

describe('per-part default offset editor flow', () => {
  it('editing default offset affects future asset render descriptions', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, '/lib')

    // Edit the part's default offset
    const newOffset: Transform = { position: [0, 0.1, 0], rotation: [0, 0, 0], scale: 1 }
    store.getState().savePartDefaultOffset(headPartId, newOffset)

    // Verify the library part was updated
    expect(store.getState().library.parts['head_male_base']?.defaultOffset).toStrictEqual(newOffset)

    // Create a new instance — it should use the updated default
    const newInstance = createInstanceFromTemplate(humanoidTemplate, 'Test')
    const renderDesc = buildRenderDescription(
      newInstance,
      humanoidTemplate,
      store.getState().library,
    )

    const headNode = renderDesc.nodes.find((node) => node.slotTag.value === 'head')
    // anchor [0, 1.6, 0] + updated part default [0, 0.1, 0] + identity instance offset
    expect(headNode?.worldTransform.position[1]).toBeCloseTo(1.7)
  })
})
