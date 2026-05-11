import { describe, it, expect } from 'vitest'
import { partId, slotTag, templateId, textureId } from '../schema/ids'
import type { Part } from '../schema/part'
import type { Template } from '../schema/template'
import type { Texture } from '../schema/texture'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { buildIndexFromParts, filterPartsByTag, searchPartsByName } from './library-index'

const headTag = slotTag('head')
const torsoTag = slotTag('torso')
const leftArmTag = slotTag('left_arm')

const headPart: Part = {
  id: partId('head_male_base'),
  name: 'Male Head (Base)',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const headElfPart: Part = {
  id: partId('head_elf'),
  name: 'Elf Head',
  tags: [headTag],
  meshFile: 'parts/head/head_elf.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const torsoPart: Part = {
  id: partId('torso_male_base'),
  name: 'Male Torso (Base)',
  tags: [torsoTag],
  meshFile: 'parts/torso/torso_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const armPart: Part = {
  id: partId('arm_human_base'),
  name: 'Human Arm (Left)',
  tags: [leftArmTag],
  meshFile: 'parts/left_arm/arm_human_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const humanoidTemplate: Template = {
  id: templateId('humanoid'),
  name: 'Humanoid',
  description: 'Biped',
  version: 1,
  slots: [],
}

const skinTexture: Texture = {
  id: textureId('skin_pale'),
  name: 'Pale Skin',
  file: 'textures/skin_pale.png',
  width: 64,
  height: 64,
  tags: ['skin'],
}

const allParts = [headPart, headElfPart, torsoPart, armPart]

describe('buildIndexFromParts', () => {
  it('indexes templates by id', () => {
    const index = buildIndexFromParts([humanoidTemplate], [], [])
    expect(index.templates['humanoid']).toBeDefined()
    expect(index.templates['humanoid']?.name).toBe('Humanoid')
  })

  it('indexes parts by id', () => {
    const index = buildIndexFromParts([], allParts, [])
    expect(index.parts['head_male_base']).toBeDefined()
    expect(index.parts['torso_male_base']).toBeDefined()
    expect(index.parts['arm_human_base']).toBeDefined()
  })

  it('indexes textures by id', () => {
    const index = buildIndexFromParts([], [], [skinTexture])
    expect(index.textures['skin_pale']).toBeDefined()
    expect(index.textures['skin_pale']?.name).toBe('Pale Skin')
  })

  it('builds partsByTag grouping', () => {
    const index = buildIndexFromParts([], allParts, [])
    expect(index.partsByTag['head']).toHaveLength(2)
    expect(index.partsByTag['torso']).toHaveLength(1)
    expect(index.partsByTag['left_arm']).toHaveLength(1)
  })

  it('returns empty records for empty inputs', () => {
    const index = buildIndexFromParts([], [], [])
    expect(Object.keys(index.templates)).toHaveLength(0)
    expect(Object.keys(index.parts)).toHaveLength(0)
    expect(Object.keys(index.textures)).toHaveLength(0)
    expect(Object.keys(index.partsByTag)).toHaveLength(0)
  })
})

describe('filterPartsByTag', () => {
  const index = buildIndexFromParts([humanoidTemplate], allParts, [skinTexture])

  it('returns parts matching the given tag', () => {
    const heads = filterPartsByTag(index, headTag)
    expect(heads).toHaveLength(2)
    expect(heads.map((p) => p.id.value).sort()).toStrictEqual(['head_elf', 'head_male_base'])
  })

  it('returns a single part for a tag with one match', () => {
    const torsos = filterPartsByTag(index, torsoTag)
    expect(torsos).toHaveLength(1)
    expect(torsos[0]?.name).toBe('Male Torso (Base)')
  })

  it('returns an empty array for a tag with no parts', () => {
    const unknownTag = slotTag('tail')
    expect(filterPartsByTag(index, unknownTag)).toHaveLength(0)
  })
})

describe('searchPartsByName', () => {
  const index = buildIndexFromParts([], allParts, [])

  it('finds parts by case-insensitive partial match', () => {
    const results = searchPartsByName(index, 'male')
    expect(results).toHaveLength(2)
    expect(results.map((p) => p.id.value).sort()).toStrictEqual([
      'head_male_base',
      'torso_male_base',
    ])
  })

  it('finds parts regardless of case', () => {
    const results = searchPartsByName(index, 'ELF')
    expect(results).toHaveLength(1)
    expect(results[0]?.id.value).toBe('head_elf')
  })

  it('finds parts by partial name', () => {
    const results = searchPartsByName(index, 'Human')
    expect(results).toHaveLength(1)
    expect(results[0]?.id.value).toBe('arm_human_base')
  })

  it('returns all parts for empty query', () => {
    const results = searchPartsByName(index, '')
    expect(results).toHaveLength(4)
  })

  it('returns empty for no matches', () => {
    const results = searchPartsByName(index, 'dragon')
    expect(results).toHaveLength(0)
  })
})
