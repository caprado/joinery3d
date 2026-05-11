import { describe, it, expect } from 'vitest'
import type { Vec3 } from './vec'
import {
  type Transform,
  IDENTITY_TRANSFORM,
  composeTransform,
  invertTransform,
  mirrorXTransform,
  isTransform,
} from './transform'

describe('IDENTITY_TRANSFORM', () => {
  it('has zero position, zero rotation, and unit scale', () => {
    expect(IDENTITY_TRANSFORM).toStrictEqual({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    })
  })
})

describe('composeTransform', () => {
  it('returns the offset when the base is identity', () => {
    const offset: Transform = {
      position: [1, 2, 3],
      rotation: [0.1, 0.2, 0.3],
      scale: 2,
    }
    const result = composeTransform(IDENTITY_TRANSFORM, offset)
    expect(result.position).toStrictEqual([1, 2, 3])
    expect(result.rotation).toStrictEqual([0.1, 0.2, 0.3])
    expect(result.scale).toStrictEqual([2, 2, 2])
  })

  it('returns the base when the offset is identity', () => {
    const base: Transform = {
      position: [4, 5, 6],
      rotation: [0.4, 0.5, 0.6],
      scale: 3,
    }
    const result = composeTransform(base, IDENTITY_TRANSFORM)
    expect(result.position).toStrictEqual([4, 5, 6])
    expect(result.rotation).toStrictEqual([0.4, 0.5, 0.6])
    expect(result.scale).toStrictEqual([3, 3, 3])
  })

  it('adds positions component-wise', () => {
    const a: Transform = { position: [1, 2, 3], rotation: [0, 0, 0], scale: 1 }
    const b: Transform = { position: [4, 5, 6], rotation: [0, 0, 0], scale: 1 }
    expect(composeTransform(a, b).position).toStrictEqual([5, 7, 9])
  })

  it('adds rotations component-wise', () => {
    const a: Transform = { position: [0, 0, 0], rotation: [0.1, 0.2, 0.3], scale: 1 }
    const b: Transform = { position: [0, 0, 0], rotation: [0.4, 0.5, 0.6], scale: 1 }
    const result = composeTransform(a, b).rotation
    expect(result[0]).toBeCloseTo(0.5)
    expect(result[1]).toBeCloseTo(0.7)
    expect(result[2]).toBeCloseTo(0.9)
  })

  it('multiplies scales', () => {
    const a: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 2 }
    const b: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 3 }
    expect(composeTransform(a, b).scale).toStrictEqual([6, 6, 6])
  })

  it('handles non-uniform Vec3 scales', () => {
    const scaleA: Vec3 = [2, 3, 4]
    const scaleB: Vec3 = [0.5, 2, 0.25]
    const a: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: scaleA }
    const b: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: scaleB }
    expect(composeTransform(a, b).scale).toStrictEqual([1, 6, 1])
  })
})

describe('invertTransform', () => {
  it('negates position and rotation, inverts scale', () => {
    const transform: Transform = {
      position: [1, 2, 3],
      rotation: [0.1, 0.2, 0.3],
      scale: 2,
    }
    const inverted = invertTransform(transform)
    expect(inverted.position).toStrictEqual([-1, -2, -3])
    expect(inverted.rotation).toStrictEqual([-0.1, -0.2, -0.3])
    expect(inverted.scale).toStrictEqual([0.5, 0.5, 0.5])
  })

  it('returns identity when inverting identity', () => {
    const inverted = invertTransform(IDENTITY_TRANSFORM)
    expect(inverted.position[0]).toBeCloseTo(0)
    expect(inverted.position[1]).toBeCloseTo(0)
    expect(inverted.position[2]).toBeCloseTo(0)
    expect(inverted.rotation[0]).toBeCloseTo(0)
    expect(inverted.rotation[1]).toBeCloseTo(0)
    expect(inverted.rotation[2]).toBeCloseTo(0)
    expect(inverted.scale).toStrictEqual([1, 1, 1])
  })
})

describe('mirrorXTransform', () => {
  it('negates X position and Y/Z rotation', () => {
    const transform: Transform = {
      position: [3, 4, 5],
      rotation: [0.1, 0.2, 0.3],
      scale: 2,
    }
    const mirrored = mirrorXTransform(transform)
    expect(mirrored.position).toStrictEqual([-3, 4, 5])
    expect(mirrored.rotation).toStrictEqual([0.1, -0.2, -0.3])
    expect(mirrored.scale).toBe(2)
  })

  it('double mirror returns the original', () => {
    const mirrorScale: Vec3 = [2, 3, 4]
    const transform: Transform = {
      position: [1.5, -2.5, 3.5],
      rotation: [0.7, -0.3, 1.2],
      scale: mirrorScale,
    }
    const doubleMirrored = mirrorXTransform(mirrorXTransform(transform))
    expect(doubleMirrored.position[0]).toBeCloseTo(transform.position[0])
    expect(doubleMirrored.position[1]).toBeCloseTo(transform.position[1])
    expect(doubleMirrored.position[2]).toBeCloseTo(transform.position[2])
    expect(doubleMirrored.rotation[0]).toBeCloseTo(transform.rotation[0])
    expect(doubleMirrored.rotation[1]).toBeCloseTo(transform.rotation[1])
    expect(doubleMirrored.rotation[2]).toBeCloseTo(transform.rotation[2])
    expect(doubleMirrored.scale).toStrictEqual(transform.scale)
  })

  it('preserves scale', () => {
    const transform: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 5 }
    expect(mirrorXTransform(transform).scale).toBe(5)
  })
})

describe('isTransform', () => {
  it('returns true for a valid transform with numeric scale', () => {
    expect(isTransform({ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 })).toBe(true)
  })

  it('returns true for a valid transform with Vec3 scale', () => {
    expect(isTransform({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isTransform(null)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isTransform('string')).toBe(false)
  })

  it('returns false for missing position', () => {
    expect(isTransform({ rotation: [0, 0, 0], scale: 1 })).toBe(false)
  })

  it('returns false for invalid scale type', () => {
    expect(isTransform({ position: [0, 0, 0], rotation: [0, 0, 0], scale: 'big' })).toBe(false)
  })
})
