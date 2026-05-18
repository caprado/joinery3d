import { describe, it, expect } from 'vitest'
import { partId, slotTag, templateId, textureId, assetInstanceId } from '../schema/ids'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import type { LibraryIndex } from '../schema/library'
import type { Template } from '../schema/template'
import type { AssetInstance } from '../schema/instance'
import { buildRenderDescription } from '../core/assembly'
import { setSlotTexture } from './actions/set-slot-texture'
import { initialState } from './state'

const headTag = slotTag('head')
const headPartId = partId('head_male_base')
const skinPaleId = textureId('skin_pale')
const skinDarkId = textureId('skin_dark')
const normalMapId = textureId('normal_default')

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
        { channel: 'normal', defaultTextureId: undefined, variants: [] },
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
    skin_dark: {
      id: skinDarkId,
      name: 'Dark Skin',
      file: 'textures/skin_dark.png',
      width: 64,
      height: 64,
      tags: ['skin'],
    },
    normal_default: {
      id: normalMapId,
      name: 'Default Normal',
      file: 'textures/normal_default.png',
      width: 64,
      height: 64,
      tags: ['normal'],
    },
  },
  partsByTag: {
    head: [headPartId],
  },
}

const template: Template = library.templates['humanoid'] as Template

const createInstance = (
  textures: Partial<Record<string, ReturnType<typeof textureId>>>,
): AssetInstance => ({
  id: assetInstanceId('test'),
  name: 'Test',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: {
      partId: headPartId,
      offset: IDENTITY_TRANSFORM,
      textures,
    },
  },
})

const requireInstance = (state: { readonly currentInstance: AssetInstance | undefined }): AssetInstance => {
  if (state.currentInstance === undefined) throw new Error('Expected currentInstance to be defined')
  return state.currentInstance
}

describe('texture pipeline: store action to render description', () => {
  it('setSlotTexture assigns a diffuse texture that buildRenderDescription resolves', () => {
    const state = {
      ...initialState,
      library,
      currentInstance: createInstance({}),
    }

    const updated = setSlotTexture(state, headTag, 'diffuse', skinPaleId)
    const description = buildRenderDescription(requireInstance(updated), template, library)

    expect(description.nodes).toHaveLength(1)
    expect(description.nodes[0]?.textures['diffuse']).toBe('textures/skin_pale.png')
  })

  it('changing a texture from one to another updates the resolved path', () => {
    const state = {
      ...initialState,
      library,
      currentInstance: createInstance({ diffuse: skinPaleId }),
    }

    const updated = setSlotTexture(state, headTag, 'diffuse', skinDarkId)
    const description = buildRenderDescription(requireInstance(updated), template, library)

    expect(description.nodes[0]?.textures['diffuse']).toBe('textures/skin_dark.png')
  })

  it('removing a texture excludes it from the render description', () => {
    const state = {
      ...initialState,
      library,
      currentInstance: createInstance({ diffuse: skinPaleId }),
    }

    const updated = setSlotTexture(state, headTag, 'diffuse', undefined)
    const description = buildRenderDescription(requireInstance(updated), template, library)

    expect(description.nodes[0]?.textures['diffuse']).toBeUndefined()
  })

  it('multiple texture channels resolve independently', () => {
    const state = {
      ...initialState,
      library,
      currentInstance: createInstance({}),
    }

    const withDiffuse = setSlotTexture(state, headTag, 'diffuse', skinPaleId)
    const withBoth = setSlotTexture(withDiffuse, headTag, 'normal', normalMapId)
    const description = buildRenderDescription(requireInstance(withBoth), template, library)

    expect(description.nodes[0]?.textures['diffuse']).toBe('textures/skin_pale.png')
    expect(description.nodes[0]?.textures['normal']).toBe('textures/normal_default.png')
  })

  it('texture for nonexistent texture ID is excluded from render description', () => {
    const instance = createInstance({ diffuse: textureId('does_not_exist') })
    const description = buildRenderDescription(instance, template, library)

    expect(description.nodes[0]?.textures['diffuse']).toBeUndefined()
  })

  it('setSlotTexture creates a new instance reference for change detection', () => {
    const original = createInstance({})
    const state = {
      ...initialState,
      library,
      currentInstance: original,
    }

    const updated = setSlotTexture(state, headTag, 'diffuse', skinPaleId)
    expect(updated.currentInstance).not.toBe(original)
  })
})
