import { describe, it, expect } from 'vitest'
import type { FsAdapter } from '../fs/adapter'
import { scanLibrary } from './scan'

const sampleFiles: Record<string, string> = {
  '/lib/templates/humanoid.template.json': JSON.stringify({
    id: 'humanoid',
    name: 'Humanoid',
    description: 'Basic biped',
    version: 1,
    slots: [
      {
        tag: 'head',
        name: 'Head',
        anchor: { position: [0, 1.6, 0], rotation: [0, 0, 0], scale: 1 },
        defaultPartId: 'head_male_base',
        pairedSlot: null,
        required: true,
      },
    ],
  }),
  '/lib/parts/head/head_male_base.json': JSON.stringify({
    id: 'head_male_base',
    name: 'Male Head (Base)',
    tags: ['head'],
    meshFile: 'parts/head/head_male_base.glb',
    defaultOffset: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
    textureSlots: [{ channel: 'diffuse', defaultTextureId: 'skin_pale' }],
    thumbnailFile: null,
  }),
  '/lib/parts/head/head_elf.json': JSON.stringify({
    id: 'head_elf',
    name: 'Elf Head',
    tags: ['head'],
    meshFile: 'parts/head/head_elf.glb',
    defaultOffset: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
    textureSlots: [],
    thumbnailFile: null,
  }),
  '/lib/textures/skin_pale.json': JSON.stringify({
    id: 'skin_pale',
    name: 'Pale Skin',
    file: 'textures/skin_pale.png',
    width: 64,
    height: 64,
    tags: ['skin'],
  }),
  '/lib/parts/head/invalid.json': 'not valid json {{{',
}

const fileList = [
  'templates/humanoid.template.json',
  'parts/head/head_male_base.json',
  'parts/head/head_male_base.glb',
  'parts/head/head_elf.json',
  'parts/head/head_elf.glb',
  'parts/head/invalid.json',
  'textures/skin_pale.json',
  'textures/skin_pale.png',
]

const mockAdapter: FsAdapter = {
  pickFolder: () => Promise.resolve(undefined),
  readTextFile: (path) => {
    const content = sampleFiles[path]
    if (content === undefined) return Promise.reject(new Error(`File not found: ${path}`))
    return Promise.resolve(content)
  },
  writeTextFile: () => Promise.resolve(),
  readBinaryFile: () => Promise.resolve(new Uint8Array()),
  writeBinaryFile: () => Promise.resolve(),
  listFiles: () => Promise.resolve(fileList),
  watchFolder: () => () => undefined,
}

describe('scanLibrary', () => {
  it('indexes templates from .template.json files', async () => {
    const index = await scanLibrary('/lib', mockAdapter)
    expect(index.templates['humanoid']).toBeDefined()
    expect(index.templates['humanoid']?.name).toBe('Humanoid')
  })

  it('indexes parts from .json files (excluding templates and textures)', async () => {
    const index = await scanLibrary('/lib', mockAdapter)
    expect(index.parts['head_male_base']).toBeDefined()
    expect(index.parts['head_elf']).toBeDefined()
    expect(Object.keys(index.parts)).toHaveLength(2)
  })

  it('indexes textures from textures/ folder .json files', async () => {
    const index = await scanLibrary('/lib', mockAdapter)
    expect(index.textures['skin_pale']).toBeDefined()
    expect(index.textures['skin_pale']?.name).toBe('Pale Skin')
  })

  it('builds partsByTag grouping', async () => {
    const index = await scanLibrary('/lib', mockAdapter)
    expect(index.partsByTag['head']).toHaveLength(2)
  })

  it('skips invalid JSON files without crashing', async () => {
    const index = await scanLibrary('/lib', mockAdapter)
    expect(Object.keys(index.parts)).toHaveLength(2)
  })

  it('skips files that cannot be read', async () => {
    const adapterWithErrors: FsAdapter = {
      ...mockAdapter,
      readTextFile: (path) => {
        if (path.includes('head_elf')) return Promise.reject(new Error('read error'))
        return mockAdapter.readTextFile(path)
      },
    }
    const index = await scanLibrary('/lib', adapterWithErrors)
    expect(index.parts['head_male_base']).toBeDefined()
    expect(index.parts['head_elf']).toBeUndefined()
  })

  it('returns an empty index for an empty library', async () => {
    const emptyAdapter: FsAdapter = {
      ...mockAdapter,
      listFiles: () => Promise.resolve([]),
    }
    const index = await scanLibrary('/lib', emptyAdapter)
    expect(Object.keys(index.templates)).toHaveLength(0)
    expect(Object.keys(index.parts)).toHaveLength(0)
    expect(Object.keys(index.textures)).toHaveLength(0)
  })
})
