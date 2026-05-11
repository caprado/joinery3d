import { describe, it, expect } from 'vitest'
import type { Transform } from '../schema/transform'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { applySnap, transformEqual } from './transforms'

describe('applySnap', () => {
  it('rounds position to translation increment', () => {
    const transform: Transform = {
      position: [0.07, 0.12, 0.23],
      rotation: [0, 0, 0],
      scale: 1,
    }
    const snapped = applySnap(transform, 0.05, 0, 0)
    expect(snapped.position[0]).toBeCloseTo(0.05)
    expect(snapped.position[1]).toBeCloseTo(0.10)
    expect(snapped.position[2]).toBeCloseTo(0.25)
  })

  it('rounds rotation to rotation increment', () => {
    const transform: Transform = {
      position: [0, 0, 0],
      rotation: [0.08, 0.17, 0.26],
      scale: 1,
    }
    const snapped = applySnap(transform, 0, 0.1, 0)
    expect(snapped.rotation[0]).toBeCloseTo(0.1)
    expect(snapped.rotation[1]).toBeCloseTo(0.2)
    expect(snapped.rotation[2]).toBeCloseTo(0.3)
  })

  it('rounds uniform scale to scale increment', () => {
    const transform: Transform = {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1.17,
    }
    const snapped = applySnap(transform, 0, 0, 0.1)
    expect(snapped.scale).toBeCloseTo(1.2)
  })

  it('rounds non-uniform scale components individually', () => {
    const scaleVec: [number, number, number] = [1.03, 2.07, 3.14]
    const transform: Transform = {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: scaleVec,
    }
    const snapped = applySnap(transform, 0, 0, 0.1)
    expect(typeof snapped.scale).not.toBe('number')
    if (typeof snapped.scale !== 'number') {
      expect(snapped.scale[0]).toBeCloseTo(1.0)
      expect(snapped.scale[1]).toBeCloseTo(2.1)
      expect(snapped.scale[2]).toBeCloseTo(3.1)
    }
  })

  it('does not snap when increment is zero', () => {
    const transform: Transform = {
      position: [0.123, 0.456, 0.789],
      rotation: [0.111, 0.222, 0.333],
      scale: 1.555,
    }
    const snapped = applySnap(transform, 0, 0, 0)
    expect(snapped.position).toStrictEqual(transform.position)
    expect(snapped.rotation).toStrictEqual(transform.rotation)
    expect(snapped.scale).toBe(transform.scale)
  })

  it('snaps negative values correctly', () => {
    const transform: Transform = {
      position: [-0.07, -0.12, -0.23],
      rotation: [0, 0, 0],
      scale: 1,
    }
    const snapped = applySnap(transform, 0.05, 0, 0)
    expect(snapped.position[0]).toBeCloseTo(-0.05)
    expect(snapped.position[1]).toBeCloseTo(-0.10)
    expect(snapped.position[2]).toBeCloseTo(-0.25)
  })
})

describe('transformEqual', () => {
  it('returns true for identical transforms', () => {
    const transform: Transform = {
      position: [1, 2, 3],
      rotation: [0.1, 0.2, 0.3],
      scale: 2,
    }
    expect(transformEqual(transform, transform)).toBe(true)
  })

  it('returns true for identity compared to itself', () => {
    expect(transformEqual(IDENTITY_TRANSFORM, IDENTITY_TRANSFORM)).toBe(true)
  })

  it('returns true for uniform vs non-uniform equivalent scales', () => {
    const a: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 2 }
    const scaleVec: [number, number, number] = [2, 2, 2]
    const b: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: scaleVec }
    expect(transformEqual(a, b)).toBe(true)
  })

  it('returns false when positions differ', () => {
    const a: Transform = { position: [1, 2, 3], rotation: [0, 0, 0], scale: 1 }
    const b: Transform = { position: [1, 2, 4], rotation: [0, 0, 0], scale: 1 }
    expect(transformEqual(a, b)).toBe(false)
  })

  it('returns false when rotations differ', () => {
    const a: Transform = { position: [0, 0, 0], rotation: [0.1, 0.2, 0.3], scale: 1 }
    const b: Transform = { position: [0, 0, 0], rotation: [0.1, 0.2, 0.4], scale: 1 }
    expect(transformEqual(a, b)).toBe(false)
  })

  it('returns false when scales differ', () => {
    const a: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 2 }
    const b: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 3 }
    expect(transformEqual(a, b)).toBe(false)
  })

  it('treats values within epsilon as equal', () => {
    const a: Transform = { position: [1, 2, 3], rotation: [0, 0, 0], scale: 1 }
    const b: Transform = {
      position: [1 + 1e-10, 2 - 1e-10, 3 + 1e-10],
      rotation: [0, 0, 0],
      scale: 1,
    }
    expect(transformEqual(a, b)).toBe(true)
  })
})
