import { describe, it, expect } from 'vitest'
import { partId, templateId, textureId, assetInstanceId } from '../../schema/ids'
import type { AssetInstance } from '../../schema/instance'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import type { FsAdapter } from '../fs/adapter'
import { saveProject } from './save'
import { loadProject } from './load'

const testInstance: AssetInstance = {
  id: assetInstanceId('elf_warrior_v1'),
  name: 'Elf Warrior',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: {
      partId: partId('head_elf'),
      offset: { position: [0, 0.02, 0], rotation: [0, 0, 0], scale: 1 },
      textures: { diffuse: textureId('head_elf_pale') },
    },
    torso: {
      partId: partId('torso_male_base'),
      offset: IDENTITY_TRANSFORM,
      textures: {},
    },
  },
}

describe('project save and load', () => {
  it('roundtrips an asset instance through JSON', async () => {
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

    await saveProject(testInstance, '/projects/elf.json', adapter)

    const result = await loadProject('/projects/elf.json', adapter)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.id.value).toBe('elf_warrior_v1')
    expect(result.value.name).toBe('Elf Warrior')
    expect(result.value.templateId.value).toBe('humanoid')
    expect(result.value.version).toBe(1)
    expect(result.value.slots['head']?.partId.value).toBe('head_elf')
    expect(result.value.slots['head']?.offset.position).toStrictEqual([0, 0.02, 0])
    expect(result.value.slots['head']?.textures['diffuse']?.value).toBe('head_elf_pale')
    expect(result.value.slots['torso']?.partId.value).toBe('torso_male_base')
    expect(result.value.slots['torso']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
    expect(result.value.slots['torso']?.textures).toStrictEqual({})
  })

  it('save writes valid JSON', async () => {
    let written = ''
    const adapter: FsAdapter = {
      pickFolder: () => Promise.resolve(undefined),
      readTextFile: () => Promise.resolve(''),
      writeTextFile: (_, content) => {
        written = content
        return Promise.resolve()
      },
      readBinaryFile: () => Promise.resolve(new Uint8Array()),
      writeBinaryFile: () => Promise.resolve(),
      listFiles: () => Promise.resolve([]),
      watchFolder: () => () => undefined,
    }

    await saveProject(testInstance, '/test.json', adapter)
    const parsed: unknown = JSON.parse(written)
    expect(parsed).toBeDefined()
    expect(typeof parsed === 'object' && parsed !== null).toBe(true)
  })

  it('load returns error for invalid JSON', async () => {
    const adapter: FsAdapter = {
      pickFolder: () => Promise.resolve(undefined),
      readTextFile: () => Promise.resolve('not valid json {{{'),
      writeTextFile: () => Promise.resolve(),
      readBinaryFile: () => Promise.resolve(new Uint8Array()),
      writeBinaryFile: () => Promise.resolve(),
      listFiles: () => Promise.resolve([]),
      watchFolder: () => () => undefined,
    }

    const result = await loadProject('/bad.json', adapter)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe('Invalid JSON')
    }
  })

  it('load returns error for valid JSON with wrong schema', async () => {
    const adapter: FsAdapter = {
      pickFolder: () => Promise.resolve(undefined),
      readTextFile: () => Promise.resolve('{"notAnInstance": true}'),
      writeTextFile: () => Promise.resolve(),
      readBinaryFile: () => Promise.resolve(new Uint8Array()),
      writeBinaryFile: () => Promise.resolve(),
      listFiles: () => Promise.resolve([]),
      watchFolder: () => () => undefined,
    }

    const result = await loadProject('/wrong.json', adapter)
    expect(result.ok).toBe(false)
  })
})
