/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { partId, slotTag } from '../../schema/ids'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import type { RenderDescription } from '../../core/assembly'
import type { FsAdapter } from '../fs/adapter'
import { exportGlb } from './export'
import { loadGlb } from './load'

const createMinimalGlb = (): Uint8Array => {
  const json = JSON.stringify({
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'TestMesh' }],
    meshes: [{
      name: 'TestMesh',
      primitives: [{ attributes: { POSITION: 0 }, indices: 1 }],
    }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 0], min: [-1, -1, 0] },
      { bufferView: 1, componentType: 5123, count: 3, type: 'SCALAR', max: [2], min: [0] },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 36, byteLength: 8, target: 34963 },
    ],
    buffers: [{ byteLength: 44 }],
  })

  const jsonPadded = json + ' '.repeat((4 - (json.length % 4)) % 4)
  const jsonBytes = new TextEncoder().encode(jsonPadded)

  // Binary data: 3 vertices (9 floats) + 3 indices (3 uint16 + 2 padding)
  const binData = new ArrayBuffer(44)
  const floatView = new Float32Array(binData, 0, 9)
  floatView.set([-1, -1, 0, 1, -1, 0, 0, 1, 0])
  const indexView = new Uint16Array(binData, 36, 3)
  indexView.set([0, 1, 2])

  const totalLength = 12 + 8 + jsonBytes.length + 8 + 44
  const glbBuffer = new ArrayBuffer(totalLength)
  const glbView = new DataView(glbBuffer)
  const glbBytes = new Uint8Array(glbBuffer)

  glbView.setUint32(0, 0x46546c67, true)
  glbView.setUint32(4, 2, true)
  glbView.setUint32(8, totalLength, true)
  glbView.setUint32(12, jsonBytes.length, true)
  glbView.setUint32(16, 0x4e4f534a, true)
  glbBytes.set(jsonBytes, 20)
  glbView.setUint32(20 + jsonBytes.length, 44, true)
  glbView.setUint32(24 + jsonBytes.length, 0x004e4942, true)
  glbBytes.set(new Uint8Array(binData), 28 + jsonBytes.length)

  return glbBytes
}

const headTag = slotTag('head')
const headPartId = partId('head_male_base')

const sampleGlb = createMinimalGlb()

const mockAdapter: FsAdapter = {
  pickFolder: () => Promise.resolve(undefined),
  readTextFile: () => Promise.resolve(''),
  writeTextFile: () => Promise.resolve(),
  readBinaryFile: (path) => {
    if (path.endsWith('.glb')) return Promise.resolve(sampleGlb)
    if (path.endsWith('.png')) return Promise.resolve(new Uint8Array([137, 80, 78, 71]))
    return Promise.reject(new Error(`Not found: ${path}`))
  },
  writeBinaryFile: () => Promise.resolve(),
  listFiles: () => Promise.resolve([]),
  watchFolder: () => () => undefined,
}

describe('exportGlb', () => {
  it('produces a valid GLB from a render description', async () => {
    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: headPartId,
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: {},
        },
      ],
    }

    const result = await exportGlb(description, '/lib', mockAdapter, {
      embedTextures: false,
      bakeHierarchyFlat: false,
    })

    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)

    // Verify the GLB magic bytes
    const view = new DataView(result.buffer, result.byteOffset, result.byteLength)
    expect(view.getUint32(0, true)).toBe(0x46546c67)
    expect(view.getUint32(4, true)).toBe(2)
  })

  it('exported GLB can be loaded back', async () => {
    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: headPartId,
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: { position: [1, 2, 3], rotation: [0, 0, 0], scale: 1 },
          textures: {},
        },
      ],
    }

    const exported = await exportGlb(description, '/lib', mockAdapter, {
      embedTextures: false,
      bakeHierarchyFlat: false,
    })

    const loaded = await loadGlb(exported)
    expect(loaded.scene).toBeDefined()
    expect(loaded.meshCount).toBeGreaterThanOrEqual(1)
  })

  it('returns empty GLB for empty render description', async () => {
    const description: RenderDescription = { nodes: [] }

    const result = await exportGlb(description, '/lib', mockAdapter, {
      embedTextures: false,
      bakeHierarchyFlat: false,
    })

    expect(result).toBeInstanceOf(Uint8Array)
    const view = new DataView(result.buffer, result.byteOffset, result.byteLength)
    expect(view.getUint32(0, true)).toBe(0x46546c67)
  })

  it('handles bakeHierarchyFlat option', async () => {
    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: headPartId,
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: { position: [1, 0, 0], rotation: [0, 0, 0], scale: 2 },
          textures: {},
        },
      ],
    }

    const result = await exportGlb(description, '/lib', mockAdapter, {
      embedTextures: false,
      bakeHierarchyFlat: true,
    })

    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
  })
})
