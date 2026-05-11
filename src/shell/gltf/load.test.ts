import { describe, it, expect } from 'vitest'
import { loadGlb } from './load'

const createMinimalGlb = (): Uint8Array => {
  // Minimal valid GLB with an empty scene
  const json = JSON.stringify({
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [] }],
  })

  // Pad JSON to 4-byte alignment
  const jsonPadded = json + ' '.repeat((4 - (json.length % 4)) % 4)
  const jsonBytes = new TextEncoder().encode(jsonPadded)

  const totalLength = 12 + 8 + jsonBytes.length
  const buffer = new ArrayBuffer(totalLength)
  const view = new DataView(buffer)

  // GLB header
  view.setUint32(0, 0x46546c67, true) // magic: glTF
  view.setUint32(4, 2, true) // version: 2
  view.setUint32(8, totalLength, true) // total length

  // JSON chunk header
  view.setUint32(12, jsonBytes.length, true) // chunk length
  view.setUint32(16, 0x4e4f534a, true) // chunk type: JSON

  // JSON chunk data
  const uint8 = new Uint8Array(buffer)
  uint8.set(jsonBytes, 20)

  return uint8
}

describe('loadGlb', () => {
  it('loads a minimal GLB and returns a scene group', async () => {
    const glb = createMinimalGlb()
    const result = await loadGlb(glb)
    expect(result.scene).toBeDefined()
    expect(result.scene.type).toBe('Group')
  })

  it('reports zero meshes for an empty scene', async () => {
    const glb = createMinimalGlb()
    const result = await loadGlb(glb)
    expect(result.meshCount).toBe(0)
  })

  it('returns a bounding box', async () => {
    const glb = createMinimalGlb()
    const result = await loadGlb(glb)
    expect(result.boundingBox.min).toHaveLength(3)
    expect(result.boundingBox.max).toHaveLength(3)
  })

  it('rejects invalid data', async () => {
    const invalid = new Uint8Array([0, 1, 2, 3])
    await expect(loadGlb(invalid)).rejects.toThrow()
  })
})
