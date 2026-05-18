import { describe, it, expect } from 'vitest'
import { partId, slotTag, templateId, textureId, assetInstanceId } from '../schema/ids'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import type { LibraryIndex } from '../schema/library'
import type { Template } from '../schema/template'
import type { AssetInstance } from '../schema/instance'
import { buildRenderDescription } from '../core/assembly'
import { createAppStore } from './store'

const requireInstance = (store: ReturnType<typeof createAppStore>): AssetInstance => {
  const instance = store.getState().currentInstance
  if (instance === undefined) throw new Error('Expected currentInstance')
  return instance
}

const headTag = slotTag('head')
const headPartId = partId('head_male_base')
const skinPaleId = textureId('skin_pale')

const library: LibraryIndex = {
  templates: {
    humanoid: {
      id: templateId('humanoid'),
      name: 'Humanoid',
      description: '',
      version: 1,
      slots: [
        {
          tag: headTag,
          name: 'Head',
          anchor: IDENTITY_TRANSFORM,
          defaultPartId: headPartId,
          pairedSlot: undefined,
          required: false,
        },
      ],
    },
  },
  parts: {
    head_male_base: {
      id: headPartId,
      name: 'Male Head',
      tags: [headTag],
      meshFile: 'parts/head/head_male_base.glb',
      defaultOffset: IDENTITY_TRANSFORM,
      textureSlots: [
        { channel: 'diffuse', defaultTextureId: skinPaleId, variants: [] },
      ],
      thumbnailFile: undefined,
    },
  },
  textures: {
    skin_pale: {
      id: skinPaleId,
      name: 'Pale Skin',
      file: 'textures/skin_pale.png',
      width: 64,
      height: 64,
      tags: ['skin'],
    },
  },
  partsByTag: {
    head: [headPartId],
  },
}

const template: Template = library.templates['humanoid'] as Template

describe('painted texture flow through the store', () => {
  it('adds a painted texture to library and assigns it to a slot', () => {
    const store = createAppStore()

    store.getState().libraryLoaded(library, 'http://localhost:5173/sample-library')
    store.getState().instanceCreated({
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: {} },
      },
    })

    const paintedTextureId = textureId('zebra_stripes')
    const blobUrl = 'blob:http://localhost:5173/fake-blob-id'

    store.getState().libraryLoaded(
      {
        ...store.getState().library,
        textures: {
          ...store.getState().library.textures,
          zebra_stripes: {
            id: paintedTextureId,
            name: 'Zebra Stripes',
            file: blobUrl,
            width: 256,
            height: 256,
            tags: [],
          },
        },
      },
      'http://localhost:5173/sample-library',
    )

    store.getState().setSlotTexture(headTag, 'diffuse', paintedTextureId)

    const state = store.getState()
    expect(state.currentInstance).toBeDefined()
    expect(state.currentInstance?.slots['head']?.textures['diffuse']?.value).toBe('zebra_stripes')

    const description = buildRenderDescription(requireInstance(store), template, state.library)
    expect(description.nodes).toHaveLength(1)
    expect(description.nodes[0]?.textures['diffuse']).toBe(blobUrl)
  })

  it('painted texture is present in library after libraryLoaded', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, 'http://localhost:5173/sample-library')

    const paintedTextureId = textureId('custom_paint')
    const blobUrl = 'blob:http://localhost:5173/another-blob'

    store.getState().libraryLoaded(
      {
        ...store.getState().library,
        textures: {
          ...store.getState().library.textures,
          custom_paint: {
            id: paintedTextureId,
            name: 'Custom Paint',
            file: blobUrl,
            width: 256,
            height: 256,
            tags: [],
          },
        },
      },
      'http://localhost:5173/sample-library',
    )

    const texture = store.getState().library.textures['custom_paint']
    expect(texture).toBeDefined()
    expect(texture?.file).toBe(blobUrl)
  })

  it('viewport receives blob URL in render description after texture assignment', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(library, 'http://localhost:5173/sample-library')
    store.getState().instanceCreated({
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: { diffuse: skinPaleId } },
      },
    })

    const desc1 = buildRenderDescription(requireInstance(store), template, store.getState().library)
    expect(desc1.nodes[0]?.textures['diffuse']).toBe('textures/skin_pale.png')

    const paintedId = textureId('painted')
    store.getState().libraryLoaded(
      {
        ...store.getState().library,
        textures: {
          ...store.getState().library.textures,
          painted: {
            id: paintedId,
            name: 'Painted',
            file: 'blob:http://localhost:5173/painted-blob',
            width: 256,
            height: 256,
            tags: [],
          },
        },
      },
      'http://localhost:5173/sample-library',
    )

    const instanceBefore = requireInstance(store)
    store.getState().setSlotTexture(headTag, 'diffuse', paintedId)
    const desc2 = buildRenderDescription(requireInstance(store), template, store.getState().library)
    expect(desc2.nodes[0]?.textures['diffuse']).toBe('blob:http://localhost:5173/painted-blob')

    expect(requireInstance(store)).not.toBe(instanceBefore)
  })
})
