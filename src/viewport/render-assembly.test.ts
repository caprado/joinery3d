import { describe, it, expect } from 'vitest'
import { Scene } from 'three'
import { partId, slotTag } from '../schema/ids'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import type { RenderDescription } from '../core/assembly'
import type { FsAdapter } from '../shell/fs/adapter'
import { createAssemblyRenderer } from './render-assembly'

const createMinimalGlb = (): Uint8Array => {
  const json = JSON.stringify({
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'Mesh' }],
    meshes: [{ name: 'Mesh', primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
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

const sampleGlb = createMinimalGlb()

const mockAdapter: FsAdapter = {
  pickFolder: () => Promise.resolve(undefined),
  pickFile: () => Promise.resolve(undefined),
  readTextFile: () => Promise.resolve(''),
  writeTextFile: () => Promise.resolve(),
  readBinaryFile: () => Promise.resolve(sampleGlb),
  writeBinaryFile: () => Promise.resolve(),
  listFiles: () => Promise.resolve([]),
  watchFolder: () => () => undefined,
}

const headTag = slotTag('head')
const torsoTag = slotTag('torso')

describe('createAssemblyRenderer', () => {
  it('adds nodes to the scene when apply is called', async () => {
    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: { position: [0, 1.6, 0], rotation: [0, 0, 0], scale: 1 },
          textures: {},
        },
      ],
    }

    await renderer.apply(description, '/lib', mockAdapter)

    const root = scene.getObjectByName('assembly-root')
    expect(root).toBeDefined()
    expect(root?.children).toHaveLength(1)
    expect(root?.children[0]?.name).toBe('head')
  })

  it('positions nodes according to worldTransform', async () => {
    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: { position: [1, 2, 3], rotation: [0.1, 0.2, 0.3], scale: 2 },
          textures: {},
        },
      ],
    }

    await renderer.apply(description, '/lib', mockAdapter)

    const root = scene.getObjectByName('assembly-root')
    const headObj = root?.children[0]
    expect(headObj?.position.x).toBeCloseTo(1)
    expect(headObj?.position.y).toBeCloseTo(2)
    expect(headObj?.position.z).toBeCloseTo(3)
    expect(headObj?.rotation.x).toBeCloseTo(0.1)
    expect(headObj?.scale.x).toBeCloseTo(2)
    expect(headObj?.scale.y).toBeCloseTo(2)
  })

  it('clears previous nodes before applying new description', async () => {
    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const desc1: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: {},
        },
        {
          slotTag: torsoTag,
          partId: partId('torso_male_base'),
          meshFile: 'parts/torso/torso_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: {},
        },
      ],
    }

    await renderer.apply(desc1, '/lib', mockAdapter)
    const root = scene.getObjectByName('assembly-root')
    expect(root?.children).toHaveLength(2)

    const desc2: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_elf'),
          meshFile: 'parts/head/head_elf.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: {},
        },
      ],
    }

    await renderer.apply(desc2, '/lib', mockAdapter)
    expect(root?.children).toHaveLength(1)
  })

  it('clear removes all nodes', async () => {
    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: {},
        },
      ],
    }

    await renderer.apply(description, '/lib', mockAdapter)
    renderer.clear()

    const root = scene.getObjectByName('assembly-root')
    expect(root?.children).toHaveLength(0)
  })

  it('getSlotObject returns the group for a slot tag', async () => {
    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: {},
        },
      ],
    }

    await renderer.apply(description, '/lib', mockAdapter)
    const obj = renderer.getSlotObject('head')
    expect(obj).toBeDefined()
    expect(obj?.name).toBe('head')
  })

  it('getSlotObject returns undefined for unknown slot', () => {
    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)
    expect(renderer.getSlotObject('unknown')).toBeUndefined()
  })

  it('requests texture files from the adapter when textures are specified', async () => {
    const requestedPaths: string[] = []
    const trackingAdapter: FsAdapter = {
      ...mockAdapter,
      readBinaryFile: (path) => {
        requestedPaths.push(path)
        return Promise.resolve(sampleGlb)
      },
    }

    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: { diffuse: 'textures/skin_pale.png', normal: 'textures/normal_default.png' },
        },
      ],
    }

    await renderer.apply(description, '/lib', trackingAdapter)

    expect(requestedPaths).toContain('/lib/parts/head/head_male_base.glb')
    expect(requestedPaths).toContain('/lib/textures/skin_pale.png')
    expect(requestedPaths).toContain('/lib/textures/normal_default.png')
  })

  it('does not request texture files when textures are empty', async () => {
    const requestedPaths: string[] = []
    const trackingAdapter: FsAdapter = {
      ...mockAdapter,
      readBinaryFile: (path) => {
        requestedPaths.push(path)
        return Promise.resolve(sampleGlb)
      },
    }

    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: {},
        },
      ],
    }

    await renderer.apply(description, '/lib', trackingAdapter)

    expect(requestedPaths).toStrictEqual(['/lib/parts/head/head_male_base.glb'])
  })

  it('does not call adapter for blob URL textures', async () => {
    const requestedPaths: string[] = []
    const trackingAdapter: FsAdapter = {
      ...mockAdapter,
      readBinaryFile: (path) => {
        requestedPaths.push(path)
        return Promise.resolve(sampleGlb)
      },
    }

    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: { diffuse: 'blob:http://localhost:5173/abc123' },
        },
      ],
    }

    await renderer.apply(description, '/lib', trackingAdapter)

    expect(requestedPaths).toContain('/lib/parts/head/head_male_base.glb')
    expect(requestedPaths).not.toContain('blob:http://localhost:5173/abc123')
  })

  it('continues rendering when a texture file fails to load', async () => {
    let callCount = 0
    const failingAdapter: FsAdapter = {
      ...mockAdapter,
      readBinaryFile: (path) => {
        callCount++
        if (path.includes('textures/')) {
          return Promise.reject(new Error('texture not found'))
        }
        return Promise.resolve(sampleGlb)
      },
    }

    const scene = new Scene()
    const renderer = createAssemblyRenderer(scene)

    const description: RenderDescription = {
      nodes: [
        {
          slotTag: headTag,
          partId: partId('head_male_base'),
          meshFile: 'parts/head/head_male_base.glb',
          worldTransform: IDENTITY_TRANSFORM,
          textures: { diffuse: 'textures/missing.png' },
        },
      ],
    }

    await renderer.apply(description, '/lib', failingAdapter)

    const root = scene.getObjectByName('assembly-root')
    expect(root?.children).toHaveLength(1)
    expect(callCount).toBe(2)
  })
})
