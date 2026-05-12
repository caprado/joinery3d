import { describe, it, expect } from 'vitest'
import type { FsAdapter } from '../fs/adapter'
import { importTexture } from './import-texture'
import type { ImportTextureOptions } from './import-texture'

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

describe('importTexture', () => {
  it('writes the PNG file to the correct path', async () => {
    const { adapter, writtenBinary } = createMockAdapter()
    const pngData = new Uint8Array([137, 80, 78, 71])
    const options: ImportTextureOptions = {
      name: 'Brick Wall',
      tags: ['wall', 'brick'],
      fileName: 'brick_wall.png',
      data: pngData,
      width: 128,
      height: 128,
    }

    await importTexture(options, '/lib', adapter)

    expect(writtenBinary.has('/lib/textures/brick_wall.png')).toBe(true)
    expect(writtenBinary.get('/lib/textures/brick_wall.png')).toStrictEqual(pngData)
  })

  it('writes the sidecar JSON with correct fields', async () => {
    const { adapter, writtenText } = createMockAdapter()
    const options: ImportTextureOptions = {
      name: 'Brick Wall',
      tags: ['wall'],
      fileName: 'brick_wall.png',
      data: new Uint8Array([1, 2]),
      width: 64,
      height: 64,
    }

    await importTexture(options, '/lib', adapter)

    const content = writtenText.get('/lib/textures/brick_wall.json') ?? ''
    const parsed = JSON.parse(content) as Record<string, unknown>
    expect(parsed['id']).toBe('brick_wall')
    expect(parsed['name']).toBe('Brick Wall')
    expect(parsed['width']).toBe(64)
    expect(parsed['height']).toBe(64)
    expect(parsed['tags']).toStrictEqual(['wall'])
  })

  it('returns the created Texture with correct fields', async () => {
    const { adapter } = createMockAdapter()
    const options: ImportTextureOptions = {
      name: 'Test Texture',
      tags: ['skin'],
      fileName: 'test.png',
      data: new Uint8Array([]),
      width: 256,
      height: 256,
    }

    const texture = await importTexture(options, '/lib', adapter)

    expect(texture.id.value).toBe('test_texture')
    expect(texture.name).toBe('Test Texture')
    expect(texture.file).toBe('textures/test_texture.png')
    expect(texture.width).toBe(256)
    expect(texture.height).toBe(256)
    expect(texture.tags).toStrictEqual(['skin'])
  })
})
