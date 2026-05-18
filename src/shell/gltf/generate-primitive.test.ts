/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { generatePrimitiveGlb } from './generate-primitive'

describe('generatePrimitiveGlb', () => {
  it('generates a valid GLB for a box', async () => {
    const result = await generatePrimitiveGlb({
      primitiveType: 'box',
      dimensions: { width: 1, height: 1, depth: 1 },
      name: 'test-box',
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
    const view = new DataView(result.buffer, result.byteOffset, result.byteLength)
    expect(view.getUint32(0, true)).toBe(0x46546c67)
  })

  it('generates a valid GLB for a sphere', async () => {
    const result = await generatePrimitiveGlb({
      primitiveType: 'sphere',
      dimensions: { width: 0.5, height: 0.5, depth: 0.5 },
      name: 'test-sphere',
    })
    expect(result).toBeInstanceOf(Uint8Array)
    const view = new DataView(result.buffer, result.byteOffset, result.byteLength)
    expect(view.getUint32(0, true)).toBe(0x46546c67)
  })

  it('generates a valid GLB for a cylinder', async () => {
    const result = await generatePrimitiveGlb({
      primitiveType: 'cylinder',
      dimensions: { width: 0.3, height: 0.8, depth: 0.3 },
      name: 'test-cylinder',
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
  })

  it('generates a valid GLB for a cone', async () => {
    const result = await generatePrimitiveGlb({
      primitiveType: 'cone',
      dimensions: { width: 0.4, height: 0.6, depth: 0.4 },
      name: 'test-cone',
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
  })
})
