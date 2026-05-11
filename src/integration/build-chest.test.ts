/**
 * End-to-end integration test: build a chest with state variants.
 *
 * Flow: create chest → swap lid to "broken" variant → export render description
 *       → confirm broken lid appears. State variants work the same as any other part swap.
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
import { setSlotPart } from '../core/slots'
import { buildRenderDescription } from '../core/assembly'
import { saveProject } from '../shell/project/save'
import { loadProject } from '../shell/project/load'
import type { FsAdapter } from '../shell/fs/adapter'

const bodyTag = slotTag('body')
const lidTag = slotTag('lid')
const lockTag = slotTag('lock')

const chestBodyId = partId('chest_body')
const lidClosedId = partId('lid_closed')
const lidOpenId = partId('lid_open')
const lidBrokenId = partId('lid_broken')
const lockIronId = partId('lock_iron')
const woodDarkId = textureId('wood_dark')
const chestTemplateId = templateId('chest')

const chestBody: Part = {
  id: chestBodyId,
  name: 'Chest Body',
  tags: [bodyTag],
  meshFile: 'parts/body/chest_body.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: woodDarkId }],
  thumbnailFile: undefined,
}

const lidClosed: Part = {
  id: lidClosedId,
  name: 'Lid (Closed)',
  tags: [lidTag],
  meshFile: 'parts/lid/lid_closed.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: woodDarkId }],
  thumbnailFile: undefined,
}

const lidOpen: Part = {
  id: lidOpenId,
  name: 'Lid (Open)',
  tags: [lidTag],
  meshFile: 'parts/lid/lid_open.glb',
  defaultOffset: { position: [0, 0.16, 0], rotation: [-1.047, 0, 0], scale: 1 },
  textureSlots: [{ channel: 'diffuse', defaultTextureId: woodDarkId }],
  thumbnailFile: undefined,
}

const lidBroken: Part = {
  id: lidBrokenId,
  name: 'Lid (Broken)',
  tags: [lidTag],
  meshFile: 'parts/lid/lid_broken.glb',
  defaultOffset: { position: [0.05, -0.02, 0], rotation: [0, 0, 0.15], scale: 1 },
  textureSlots: [{ channel: 'diffuse', defaultTextureId: woodDarkId }],
  thumbnailFile: undefined,
}

const lockIron: Part = {
  id: lockIronId,
  name: 'Iron Lock',
  tags: [lockTag],
  meshFile: 'parts/lock/lock_iron.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const woodDark: Texture = {
  id: woodDarkId,
  name: 'Dark Wood',
  file: 'textures/wood_dark.png',
  width: 64,
  height: 64,
  tags: ['wood'],
}

const chestTemplate: Template = {
  id: chestTemplateId,
  name: 'Chest',
  description: 'Container with lid and lock',
  version: 1,
  slots: [
    {
      tag: bodyTag,
      name: 'Body',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: chestBodyId,
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: lidTag,
      name: 'Lid',
      anchor: { position: [0, 0.25, -0.3], rotation: [0, 0, 0], scale: 1 },
      defaultPartId: lidClosedId,
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: lockTag,
      name: 'Lock',
      anchor: { position: [0, 0.15, 0.3], rotation: [0, 0, 0], scale: 1 },
      defaultPartId: lockIronId,
      pairedSlot: undefined,
      required: false,
    },
  ],
}

const allParts = [chestBody, lidClosed, lidOpen, lidBroken, lockIron]
const library = buildIndexFromParts([chestTemplate], allParts, [woodDark])

describe('End-to-end: build a chest with state variants', () => {
  it('creates a chest and swaps lid to broken variant', () => {
    // 1. Create chest from template
    const instance = createInstanceFromTemplate(chestTemplate, 'My Chest')
    expect(instance.slots['body']?.partId.value).toBe('chest_body')
    expect(instance.slots['lid']?.partId.value).toBe('lid_closed')
    expect(instance.slots['lock']?.partId.value).toBe('lock_iron')

    // 2. Swap lid to broken variant (state variant = same slot, different part)
    const withBrokenLid = setSlotPart(instance, lidTag, lidBrokenId)
    expect(withBrokenLid.slots['lid']?.partId.value).toBe('lid_broken')

    // 3. Build render description — broken lid should appear
    const renderDesc = buildRenderDescription(withBrokenLid, chestTemplate, library)
    expect(renderDesc.nodes).toHaveLength(3)

    const lidNode = renderDesc.nodes.find((n) => n.slotTag.value === 'lid')
    expect(lidNode?.meshFile).toBe('parts/lid/lid_broken.glb')
    expect(lidNode?.partId.value).toBe('lid_broken')

    // World transform: anchor [0, 0.25, -0.3] + part default [0.05, -0.02, 0] + identity
    expect(lidNode?.worldTransform.position[0]).toBeCloseTo(0.05)
    expect(lidNode?.worldTransform.position[1]).toBeCloseTo(0.23)
    expect(lidNode?.worldTransform.position[2]).toBeCloseTo(-0.3)
  })

  it('state variants survive save/load roundtrip', async () => {
    const instance = createInstanceFromTemplate(chestTemplate, 'Broken Chest')
    const withBrokenLid = setSlotPart(instance, lidTag, lidBrokenId)

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

    await saveProject(withBrokenLid, '/projects/broken-chest.json', adapter)
    const loadResult = await loadProject('/projects/broken-chest.json', adapter)

    expect(loadResult.ok).toBe(true)
    if (!loadResult.ok) return

    const loaded = loadResult.value
    expect(loaded.slots['lid']?.partId.value).toBe('lid_broken')
    expect(loaded.slots['body']?.partId.value).toBe('chest_body')
    expect(loaded.slots['lock']?.partId.value).toBe('lock_iron')
  })

  it('all lid variants can be swapped interchangeably', () => {
    const instance = createInstanceFromTemplate(chestTemplate, 'Variant Test')

    // Swap to open
    const withOpen = setSlotPart(instance, lidTag, lidOpenId)
    expect(withOpen.slots['lid']?.partId.value).toBe('lid_open')

    // Swap to broken
    const withBroken = setSlotPart(withOpen, lidTag, lidBrokenId)
    expect(withBroken.slots['lid']?.partId.value).toBe('lid_broken')

    // Swap back to closed
    const withClosed = setSlotPart(withBroken, lidTag, lidClosedId)
    expect(withClosed.slots['lid']?.partId.value).toBe('lid_closed')

    // Each swap renders correctly
    const openDesc = buildRenderDescription(withOpen, chestTemplate, library)
    const openLid = openDesc.nodes.find((n) => n.slotTag.value === 'lid')
    expect(openLid?.meshFile).toBe('parts/lid/lid_open.glb')

    const brokenDesc = buildRenderDescription(withBroken, chestTemplate, library)
    const brokenLid = brokenDesc.nodes.find((n) => n.slotTag.value === 'lid')
    expect(brokenLid?.meshFile).toBe('parts/lid/lid_broken.glb')
  })
})
