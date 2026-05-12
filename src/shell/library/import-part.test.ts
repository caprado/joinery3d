import { describe, it, expect } from 'vitest'
import type { FsAdapter } from '../fs/adapter'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import { importPart } from './import-part'
import type { ImportPartOptions } from './import-part'

const createMockAdapter = (): {
  adapter: FsAdapter
  writtenText: Map<string, string>
  writtenBinary: Map<string, Uint8Array>
} => {
  const writtenText = new Map<string, string>()
  const writtenBinary = new Map<string, Uint8Array>()
  const adapter: FsAdapter = {
    pickFolder: () => Promise.resolve(undefined),
    readTextFile: () => Promise.resolve(''),
    writeTextFile: (path, content) => {
      writtenText.set(path, content)
      return Promise.resolve()
    },
    readBinaryFile: () => Promise.resolve(new Uint8Array()),
    writeBinaryFile: (path, content) => {
      writtenBinary.set(path, content)
      return Promise.resolve()
    },
    listFiles: () => Promise.resolve([]),
    watchFolder: () => () => undefined,
  }
  return { adapter, writtenText, writtenBinary }
}

describe('importPart', () => {
  it('writes the GLB file to the correct path', async () => {
    const { adapter, writtenBinary } = createMockAdapter()
    const glbData = new Uint8Array([1, 2, 3, 4])
    const options: ImportPartOptions = {
      name: 'Dragon Head',
      tags: ['head'],
      defaultOffset: IDENTITY_TRANSFORM,
      fileName: 'dragon_head.glb',
      data: glbData,
    }

    await importPart(options, '/lib', adapter)

    const glbPath = '/lib/parts/head/dragon_head.glb'
    expect(writtenBinary.has(glbPath)).toBe(true)
    expect(writtenBinary.get(glbPath)).toStrictEqual(glbData)
  })

  it('writes the sidecar JSON next to the GLB', async () => {
    const { adapter, writtenText } = createMockAdapter()
    const options: ImportPartOptions = {
      name: 'Dragon Head',
      tags: ['head'],
      defaultOffset: IDENTITY_TRANSFORM,
      fileName: 'dragon_head.glb',
      data: new Uint8Array([1, 2, 3]),
    }

    await importPart(options, '/lib', adapter)

    const jsonPath = '/lib/parts/head/dragon_head.json'
    expect(writtenText.has(jsonPath)).toBe(true)

    const content = writtenText.get(jsonPath) ?? ''
    const parsed = JSON.parse(content) as Record<string, unknown>
    expect(parsed['id']).toBe('dragon_head')
    expect(parsed['name']).toBe('Dragon Head')
    expect(parsed['tags']).toStrictEqual(['head'])
    expect(parsed['meshFile']).toBe('parts/head/dragon_head.glb')
  })

  it('returns the created Part with correct fields', async () => {
    const { adapter } = createMockAdapter()
    const options: ImportPartOptions = {
      name: 'Test Part',
      tags: ['torso', 'armor'],
      defaultOffset: { position: [0, 0.1, 0], rotation: [0, 0, 0], scale: 1 },
      fileName: 'test.glb',
      data: new Uint8Array([]),
    }

    const part = await importPart(options, '/lib', adapter)

    expect(part.id.value).toBe('test_part')
    expect(part.name).toBe('Test Part')
    expect(part.tags).toHaveLength(2)
    expect(part.tags[0]?.value).toBe('torso')
    expect(part.tags[1]?.value).toBe('armor')
    expect(part.defaultOffset.position).toStrictEqual([0, 0.1, 0])
  })

  it('sanitizes the file name for the id', async () => {
    const { adapter } = createMockAdapter()
    const options: ImportPartOptions = {
      name: 'My Cool Part!',
      tags: ['head'],
      defaultOffset: IDENTITY_TRANSFORM,
      fileName: 'test.glb',
      data: new Uint8Array([]),
    }

    const part = await importPart(options, '/lib', adapter)
    expect(part.id.value).toBe('my_cool_part_')
  })

  it('uses first tag as the folder name', async () => {
    const { adapter, writtenBinary } = createMockAdapter()
    const options: ImportPartOptions = {
      name: 'Shield',
      tags: ['left_arm', 'equipment'],
      defaultOffset: IDENTITY_TRANSFORM,
      fileName: 'shield.glb',
      data: new Uint8Array([5, 6]),
    }

    await importPart(options, '/lib', adapter)

    const keys = Array.from(writtenBinary.keys())
    expect(keys[0]).toContain('parts/left_arm/')
  })
})
