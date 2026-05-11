import { describe, it, expect } from 'vitest'
import { partId, slotTag, templateId, textureId } from './ids'
import {
  type LibraryIndex,
  emptyLibrary,
  findTemplate,
  findPart,
  findTexture,
  partsForTag,
} from './library'
import type { Template } from './template'
import type { Part } from './part'
import type { Texture } from './texture'
import { IDENTITY_TRANSFORM } from './transform'

const headPartId = partId('head_male_base')
const torsoPartId = partId('torso_male_base')
const headTag = slotTag('head')
const torsoTag = slotTag('torso')
const humanoidId = templateId('humanoid')
const skinTextureId = textureId('skin_pale')

const headPart: Part = {
  id: headPartId,
  name: 'Male Head (Base)',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: skinTextureId }],
  thumbnailFile: undefined,
}

const torsoPart: Part = {
  id: torsoPartId,
  name: 'Male Torso (Base)',
  tags: [torsoTag],
  meshFile: 'parts/torso/torso_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const humanoidTemplate: Template = {
  id: humanoidId,
  name: 'Humanoid',
  description: 'Basic biped',
  slots: [
    {
      tag: headTag,
      name: 'Head',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: headPartId,
      pairedSlot: undefined,
      required: true,
    },
  ],
  version: 1,
}

const skinTexture: Texture = {
  id: skinTextureId,
  name: 'Pale Skin',
  file: 'textures/skin_pale.png',
  width: 64,
  height: 64,
  tags: ['skin'],
}

const populatedLibrary: LibraryIndex = {
  templates: { [humanoidId.value]: humanoidTemplate },
  parts: {
    [headPartId.value]: headPart,
    [torsoPartId.value]: torsoPart,
  },
  textures: { [skinTextureId.value]: skinTexture },
  partsByTag: {
    [headTag.value]: [headPartId],
    [torsoTag.value]: [torsoPartId],
  },
}

describe('emptyLibrary', () => {
  it('has no templates, parts, textures, or partsByTag', () => {
    expect(emptyLibrary.templates).toStrictEqual({})
    expect(emptyLibrary.parts).toStrictEqual({})
    expect(emptyLibrary.textures).toStrictEqual({})
    expect(emptyLibrary.partsByTag).toStrictEqual({})
  })
})

describe('findTemplate', () => {
  it('finds a template by id', () => {
    const found = findTemplate(populatedLibrary, humanoidId)
    expect(found).toBeDefined()
    expect(found?.name).toBe('Humanoid')
  })

  it('returns undefined for unknown id', () => {
    expect(findTemplate(populatedLibrary, templateId('chest'))).toBeUndefined()
  })

  it('returns undefined in empty library', () => {
    expect(findTemplate(emptyLibrary, humanoidId)).toBeUndefined()
  })
})

describe('findPart', () => {
  it('finds a part by id', () => {
    const found = findPart(populatedLibrary, headPartId)
    expect(found).toBeDefined()
    expect(found?.name).toBe('Male Head (Base)')
  })

  it('returns undefined for unknown id', () => {
    expect(findPart(populatedLibrary, partId('arm_base'))).toBeUndefined()
  })

  it('returns undefined in empty library', () => {
    expect(findPart(emptyLibrary, headPartId)).toBeUndefined()
  })
})

describe('findTexture', () => {
  it('finds a texture by id', () => {
    const found = findTexture(populatedLibrary, skinTextureId)
    expect(found).toBeDefined()
    expect(found?.name).toBe('Pale Skin')
  })

  it('returns undefined for unknown id', () => {
    expect(findTexture(populatedLibrary, textureId('metal_dark'))).toBeUndefined()
  })

  it('returns undefined in empty library', () => {
    expect(findTexture(emptyLibrary, skinTextureId)).toBeUndefined()
  })
})

describe('partsForTag', () => {
  it('returns part ids for a known tag', () => {
    const ids = partsForTag(populatedLibrary, headTag)
    expect(ids).toHaveLength(1)
    expect(ids[0]?.value).toBe('head_male_base')
  })

  it('returns an empty array for an unknown tag', () => {
    expect(partsForTag(populatedLibrary, slotTag('tail'))).toStrictEqual([])
  })

  it('returns an empty array from empty library', () => {
    expect(partsForTag(emptyLibrary, headTag)).toStrictEqual([])
  })
})
