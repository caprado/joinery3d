import { describe, it, expect } from 'vitest'
import { partId, slotTag, textureId } from '../../schema/ids'
import type { Part } from '../../schema/part'
import type { FsAdapter } from '../fs/adapter'
import { savePartMetadata } from './save-part'

const headTag = slotTag('head')
const skinPaleId = textureId('skin_pale')

const headPart: Part = {
  id: partId('head_male_base'),
  name: 'Male Head (Base)',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: { position: [0, 0.05, 0], rotation: [0, 0, 0], scale: 1 },
  textureSlots: [{ channel: 'diffuse', defaultTextureId: skinPaleId, variants: [] }],
  thumbnailFile: undefined,
}

describe('savePartMetadata', () => {
  it('writes the part sidecar JSON to the correct path', async () => {
    const written = new Map<string, string>()
    const adapter: FsAdapter = {
      pickFolder: () => Promise.resolve(undefined),
      pickFile: () => Promise.resolve(undefined),
      readTextFile: () => Promise.resolve(''),
      writeTextFile: (path, content) => {
        written.set(path, content)
        return Promise.resolve()
      },
      readBinaryFile: () => Promise.resolve(new Uint8Array()),
      writeBinaryFile: () => Promise.resolve(),
      listFiles: () => Promise.resolve([]),
      watchFolder: () => () => undefined,
    }

    await savePartMetadata(headPart, '/lib', adapter)

    const filePath = '/lib/parts/head/head_male_base.json'
    expect(written.has(filePath)).toBe(true)

    const content = written.get(filePath)
    expect(content).toBeDefined()
    const parsed: unknown = JSON.parse(content ?? '')
    expect(typeof parsed === 'object' && parsed !== null).toBe(true)

    const disk = parsed as Record<string, unknown>
    expect(disk['id']).toBe('head_male_base')
    expect(disk['name']).toBe('Male Head (Base)')
    expect(disk['tags']).toStrictEqual(['head'])
    expect(disk['meshFile']).toBe('parts/head/head_male_base.glb')
  })

  it('serializes the updated defaultOffset', async () => {
    const written = new Map<string, string>()
    const adapter: FsAdapter = {
      pickFolder: () => Promise.resolve(undefined),
      pickFile: () => Promise.resolve(undefined),
      readTextFile: () => Promise.resolve(''),
      writeTextFile: (path, content) => {
        written.set(path, content)
        return Promise.resolve()
      },
      readBinaryFile: () => Promise.resolve(new Uint8Array()),
      writeBinaryFile: () => Promise.resolve(),
      listFiles: () => Promise.resolve([]),
      watchFolder: () => () => undefined,
    }

    await savePartMetadata(headPart, '/lib', adapter)

    const content = written.get('/lib/parts/head/head_male_base.json') ?? ''
    const parsed = JSON.parse(content) as Record<string, unknown>
    const offset = parsed['defaultOffset'] as Record<string, unknown>
    expect(offset['position']).toStrictEqual([0, 0.05, 0])
    expect(offset['scale']).toBe(1)
  })

  it('serializes texture slots with null for missing defaultTextureId', async () => {
    const partNoTexture: Part = {
      ...headPart,
      textureSlots: [{ channel: 'diffuse', defaultTextureId: undefined, variants: [] }],
    }

    const written = new Map<string, string>()
    const adapter: FsAdapter = {
      pickFolder: () => Promise.resolve(undefined),
      pickFile: () => Promise.resolve(undefined),
      readTextFile: () => Promise.resolve(''),
      writeTextFile: (path, content) => {
        written.set(path, content)
        return Promise.resolve()
      },
      readBinaryFile: () => Promise.resolve(new Uint8Array()),
      writeBinaryFile: () => Promise.resolve(),
      listFiles: () => Promise.resolve([]),
      watchFolder: () => () => undefined,
    }

    await savePartMetadata(partNoTexture, '/lib', adapter)

    const content = written.get('/lib/parts/head/head_male_base.json') ?? ''
    const parsed = JSON.parse(content) as Record<string, unknown>
    const slots = parsed['textureSlots'] as Array<Record<string, unknown>>
    expect(slots[0]?.['defaultTextureId']).toBeNull()
  })
})
