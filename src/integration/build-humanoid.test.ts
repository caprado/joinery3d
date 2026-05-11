/**
 * End-to-end integration test: build a custom humanoid.
 *
 * Flow: open sample library → new humanoid → swap head → adjust transform
 *       → set texture → save project → export GLB → reload and verify.
 */
import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  textureId,
} from '../schema/ids'
import type { Part } from '../schema/part'
import type { Template } from '../schema/template'
import type { Texture } from '../schema/texture'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { buildIndexFromParts } from '../core/library-index'
import { createInstanceFromTemplate } from '../core/create-instance'
import { setSlotPart, setSlotOffset, setSlotTexture } from '../core/slots'
import { buildRenderDescription } from '../core/assembly'
import { saveProject } from '../shell/project/save'
import { loadProject } from '../shell/project/load'
import type { FsAdapter } from '../shell/fs/adapter'

const headTag = slotTag('head')
const torsoTag = slotTag('torso')
const leftLegTag = slotTag('left_leg')

const headMaleId = partId('head_male_base')
const headElfId = partId('head_elf')
const torsoMaleId = partId('torso_male_base')
const legHumanId = partId('leg_human_base')
const skinPaleId = textureId('skin_pale')
const skinDarkId = textureId('skin_dark')
const humanoidTemplateId = templateId('humanoid')

const headMale: Part = {
  id: headMaleId,
  name: 'Male Head (Base)',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: skinPaleId }],
  thumbnailFile: undefined,
}

const headElf: Part = {
  id: headElfId,
  name: 'Elf Head',
  tags: [headTag],
  meshFile: 'parts/head/head_elf.glb',
  defaultOffset: { position: [0, 0.02, 0], rotation: [0, 0, 0], scale: 1 },
  textureSlots: [{ channel: 'diffuse', defaultTextureId: skinPaleId }],
  thumbnailFile: undefined,
}

const torsoMale: Part = {
  id: torsoMaleId,
  name: 'Male Torso (Base)',
  tags: [torsoTag],
  meshFile: 'parts/torso/torso_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const legHuman: Part = {
  id: legHumanId,
  name: 'Human Leg (Left)',
  tags: [leftLegTag],
  meshFile: 'parts/left_leg/leg_human_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: skinPaleId }],
  thumbnailFile: undefined,
}

const skinPale: Texture = {
  id: skinPaleId,
  name: 'Pale Skin',
  file: 'textures/skin_pale.png',
  width: 64,
  height: 64,
  tags: ['skin'],
}

const skinDark: Texture = {
  id: skinDarkId,
  name: 'Dark Skin',
  file: 'textures/skin_dark.png',
  width: 64,
  height: 64,
  tags: ['skin'],
}

const humanoidTemplate: Template = {
  id: humanoidTemplateId,
  name: 'Humanoid',
  description: 'Basic biped',
  version: 1,
  slots: [
    {
      tag: headTag,
      name: 'Head',
      anchor: { position: [0, 1.6, 0], rotation: [0, 0, 0], scale: 1 },
      defaultPartId: headMaleId,
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: torsoTag,
      name: 'Torso',
      anchor: { position: [0, 1.0, 0], rotation: [0, 0, 0], scale: 1 },
      defaultPartId: torsoMaleId,
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: leftLegTag,
      name: 'Left Leg',
      anchor: { position: [-0.15, 0.35, 0], rotation: [0, 0, 0], scale: 1 },
      defaultPartId: legHumanId,
      pairedSlot: undefined,
      required: true,
    },
  ],
}

const allParts = [headMale, headElf, torsoMale, legHuman]
const allTextures = [skinPale, skinDark]
const library = buildIndexFromParts([humanoidTemplate], allParts, allTextures)

describe('End-to-end: build a custom humanoid', () => {
  it('completes the full workflow: create, swap, adjust, texture, save, load', async () => {
    // 1. Create a new humanoid instance from template
    const instance = createInstanceFromTemplate(humanoidTemplate, 'Custom Elf')
    expect(instance.templateId.value).toBe('humanoid')
    expect(instance.slots['head']?.partId.value).toBe('head_male_base')
    expect(instance.slots['torso']?.partId.value).toBe('torso_male_base')
    expect(instance.slots['left_leg']?.partId.value).toBe('leg_human_base')

    // 2. Swap head to elf
    const afterSwap = setSlotPart(instance, headTag, headElfId)
    expect(afterSwap.slots['head']?.partId.value).toBe('head_elf')

    // 3. Adjust head transform
    const headOffset = { position: [0, 0.05, 0], rotation: [0, 0, 0], scale: 1 } as const
    const afterAdjust = setSlotOffset(afterSwap, headTag, headOffset)
    expect(afterAdjust.slots['head']?.offset.position).toStrictEqual([0, 0.05, 0])

    // 4. Swap leg texture
    const afterTexture = setSlotTexture(afterAdjust, leftLegTag, 'diffuse', skinDarkId)
    expect(afterTexture.slots['left_leg']?.textures['diffuse']?.value).toBe('skin_dark')

    // 5. Build render description
    const renderDesc = buildRenderDescription(afterTexture, humanoidTemplate, library)
    expect(renderDesc.nodes).toHaveLength(3)

    const headNode = renderDesc.nodes.find((n) => n.slotTag.value === 'head')
    expect(headNode?.meshFile).toBe('parts/head/head_elf.glb')
    // World transform: anchor [0, 1.6, 0] + part default [0, 0.02, 0] + instance [0, 0.05, 0]
    expect(headNode?.worldTransform.position[1]).toBeCloseTo(1.67)

    const legNode = renderDesc.nodes.find((n) => n.slotTag.value === 'left_leg')
    expect(legNode?.textures['diffuse']).toBe('textures/skin_dark.png')

    // 6. Save project and reload
    const storage = new Map<string, string>()
    const adapter: FsAdapter = {
      pickFolder: () => Promise.resolve(undefined),
      readTextFile: (path) => {
        const content = storage.get(path)
        if (content === undefined) return Promise.reject(new Error(`Not found: ${path}`))
        return Promise.resolve(content)
      },
      writeTextFile: (path, content) => {
        storage.set(path, content)
        return Promise.resolve()
      },
      readBinaryFile: () => Promise.resolve(new Uint8Array()),
      writeBinaryFile: () => Promise.resolve(),
      listFiles: () => Promise.resolve([]),
      watchFolder: () => () => undefined,
    }

    await saveProject(afterTexture, '/projects/custom-elf.json', adapter)
    const loadResult = await loadProject('/projects/custom-elf.json', adapter)

    expect(loadResult.ok).toBe(true)
    if (!loadResult.ok) return

    const loaded = loadResult.value
    expect(loaded.name).toBe('Custom Elf')
    expect(loaded.templateId.value).toBe('humanoid')
    expect(loaded.slots['head']?.partId.value).toBe('head_elf')
    expect(loaded.slots['head']?.offset.position).toStrictEqual([0, 0.05, 0])
    expect(loaded.slots['left_leg']?.textures['diffuse']?.value).toBe('skin_dark')
    expect(loaded.slots['torso']?.partId.value).toBe('torso_male_base')
  })
})
