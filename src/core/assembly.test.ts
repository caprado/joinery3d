import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  textureId,
  assetInstanceId,
} from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { LibraryIndex } from '../schema/library'
import type { Part } from '../schema/part'
import type { Template } from '../schema/template'
import type { Texture } from '../schema/texture'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import type { Transform } from '../schema/transform'
import { buildRenderDescription } from './assembly'

const headTag = slotTag('head')
const torsoTag = slotTag('torso')
const lidTag = slotTag('lid')
const bodyTag = slotTag('body')

const headPartId = partId('head_male_base')
const torsoPartId = partId('torso_male_base')
const chestBodyPartId = partId('chest_body')
const lidClosedPartId = partId('lid_closed')

const skinTextureId = textureId('skin_pale')

const headPart: Part = {
  id: headPartId,
  name: 'Male Head',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: skinTextureId, variants: [] }],
  thumbnailFile: undefined,
}

const torsoPart: Part = {
  id: torsoPartId,
  name: 'Male Torso',
  tags: [torsoTag],
  meshFile: 'parts/torso/torso_male_base.glb',
  defaultOffset: { position: [0, -0.1, 0], rotation: [0, 0, 0], scale: 1 },
  textureSlots: [],
  thumbnailFile: undefined,
}

const chestBodyPart: Part = {
  id: chestBodyPartId,
  name: 'Chest Body',
  tags: [bodyTag],
  meshFile: 'parts/body/chest_body.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const lidClosedPart: Part = {
  id: lidClosedPartId,
  name: 'Lid Closed',
  tags: [lidTag],
  meshFile: 'parts/lid/lid_closed.glb',
  defaultOffset: { position: [0, 0.05, 0], rotation: [0, 0, 0], scale: 1 },
  textureSlots: [],
  thumbnailFile: undefined,
}

const skinTexture: Texture = {
  id: skinTextureId,
  name: 'Pale Skin',
  file: 'textures/skin_pale.png',
  width: 64,
  height: 64,
  tags: ['skin'],
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
    {
      tag: torsoTag,
      name: 'Torso',
      anchor: { position: [0, 1.0, 0], rotation: [0, 0, 0], scale: 1 },
      defaultPartId: torsoPartId,
      pairedSlot: undefined,
      required: true,
    },
  ],
}

const chestTemplate: Template = {
  id: templateId('chest'),
  name: 'Chest',
  description: 'Container',
  version: 1,
  slots: [
    {
      tag: bodyTag,
      name: 'Body',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: chestBodyPartId,
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: lidTag,
      name: 'Lid',
      anchor: { position: [0, 0.25, -0.3], rotation: [0, 0, 0], scale: 1 },
      defaultPartId: lidClosedPartId,
      pairedSlot: undefined,
      required: true,
    },
  ],
}

const library: LibraryIndex = {
  templates: {
    humanoid: humanoidTemplate,
    chest: chestTemplate,
  },
  parts: {
    [headPartId.value]: headPart,
    [torsoPartId.value]: torsoPart,
    [chestBodyPartId.value]: chestBodyPart,
    [lidClosedPartId.value]: lidClosedPart,
  },
  textures: {
    [skinTextureId.value]: skinTexture,
  },
  partsByTag: {
    [headTag.value]: [headPartId],
    [torsoTag.value]: [torsoPartId],
    [bodyTag.value]: [chestBodyPartId],
    [lidTag.value]: [lidClosedPartId],
  },
}

describe('buildRenderDescription', () => {
  it('produces one node per filled slot in the humanoid', () => {
    const instance: AssetInstance = {
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: { diffuse: skinTextureId } },
        torso: { partId: torsoPartId, offset: IDENTITY_TRANSFORM, textures: {} },
      },
    }

    const result = buildRenderDescription(instance, humanoidTemplate, library)
    expect(result.nodes).toHaveLength(2)
  })

  it('composes world transform from anchor + part default + instance offset', () => {
    const instanceOffset: Transform = { position: [0, 0.02, 0], rotation: [0, 0, 0], scale: 1 }
    const instance: AssetInstance = {
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        torso: { partId: torsoPartId, offset: instanceOffset, textures: {} },
      },
    }

    const result = buildRenderDescription(instance, humanoidTemplate, library)
    const torsoNode = result.nodes.find((node) => node.slotTag.value === 'torso')
    expect(torsoNode).toBeDefined()

    // anchor: [0, 1.0, 0] + part default: [0, -0.1, 0] + instance: [0, 0.02, 0]
    expect(torsoNode?.worldTransform.position[0]).toBeCloseTo(0)
    expect(torsoNode?.worldTransform.position[1]).toBeCloseTo(0.92)
    expect(torsoNode?.worldTransform.position[2]).toBeCloseTo(0)
  })

  it('resolves texture file paths from the library', () => {
    const instance: AssetInstance = {
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: { diffuse: skinTextureId } },
      },
    }

    const result = buildRenderDescription(instance, humanoidTemplate, library)
    const headNode = result.nodes.find((node) => node.slotTag.value === 'head')
    expect(headNode?.textures['diffuse']).toBe('textures/skin_pale.png')
  })

  it('skips slots with no assignment', () => {
    const instance: AssetInstance = {
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: {} },
      },
    }

    const result = buildRenderDescription(instance, humanoidTemplate, library)
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]?.slotTag.value).toBe('head')
  })

  it('skips slots whose part is not in the library', () => {
    const missingPartId = partId('nonexistent_part')
    const instance: AssetInstance = {
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        head: { partId: missingPartId, offset: IDENTITY_TRANSFORM, textures: {} },
      },
    }

    const result = buildRenderDescription(instance, humanoidTemplate, library)
    expect(result.nodes).toHaveLength(0)
  })

  it('works with the chest template', () => {
    const instance: AssetInstance = {
      id: assetInstanceId('my_chest'),
      name: 'My Chest',
      templateId: templateId('chest'),
      version: 1,
      slots: {
        body: { partId: chestBodyPartId, offset: IDENTITY_TRANSFORM, textures: {} },
        lid: { partId: lidClosedPartId, offset: IDENTITY_TRANSFORM, textures: {} },
      },
    }

    const result = buildRenderDescription(instance, chestTemplate, library)
    expect(result.nodes).toHaveLength(2)

    const lidNode = result.nodes.find((node) => node.slotTag.value === 'lid')
    // anchor: [0, 0.25, -0.3] + part default: [0, 0.05, 0] + instance: identity
    expect(lidNode?.worldTransform.position[0]).toBeCloseTo(0)
    expect(lidNode?.worldTransform.position[1]).toBeCloseTo(0.3)
    expect(lidNode?.worldTransform.position[2]).toBeCloseTo(-0.3)
  })

  it('includes meshFile from the part', () => {
    const instance: AssetInstance = {
      id: assetInstanceId('test'),
      name: 'Test',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {
        head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: {} },
      },
    }

    const result = buildRenderDescription(instance, humanoidTemplate, library)
    expect(result.nodes[0]?.meshFile).toBe('parts/head/head_male_base.glb')
  })

  it('returns empty nodes for an instance with no slots filled', () => {
    const instance: AssetInstance = {
      id: assetInstanceId('empty'),
      name: 'Empty',
      templateId: templateId('humanoid'),
      version: 1,
      slots: {},
    }

    const result = buildRenderDescription(instance, humanoidTemplate, library)
    expect(result.nodes).toHaveLength(0)
  })
})
