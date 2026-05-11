import { describe, it, expect } from 'vitest'
import {
  type Vec3,
  VEC3_ZERO,
  VEC3_ONE,
  vec3,
  addVec3,
  scaleVec3,
  mirrorXVec3,
  isVec3,
} from './vec'

describe('vec3', () => {
  it('creates a Vec3 tuple', () => {
    const v: Vec3 = vec3(1, 2, 3)
    expect(v).toStrictEqual([1, 2, 3])
  })
})

describe('VEC3_ZERO', () => {
  it('is [0, 0, 0]', () => {
    expect(VEC3_ZERO).toStrictEqual([0, 0, 0])
  })
})

describe('VEC3_ONE', () => {
  it('is [1, 1, 1]', () => {
    expect(VEC3_ONE).toStrictEqual([1, 1, 1])
  })
})

describe('addVec3', () => {
  it('adds two vectors component-wise', () => {
    expect(addVec3([1, 2, 3], [4, 5, 6])).toStrictEqual([5, 7, 9])
  })

  it('returns the other vector when one is zero', () => {
    expect(addVec3(VEC3_ZERO, [3, 4, 5])).toStrictEqual([3, 4, 5])
  })

  it('handles negative values', () => {
    expect(addVec3([1, -2, 3], [-1, 2, -3])).toStrictEqual([0, 0, 0])
  })
})

describe('scaleVec3', () => {
  it('multiplies each component by the scalar', () => {
    expect(scaleVec3([1, 2, 3], 2)).toStrictEqual([2, 4, 6])
  })

  it('returns zero when scaled by zero', () => {
    expect(scaleVec3([5, 10, 15], 0)).toStrictEqual([0, 0, 0])
  })

  it('negates when scaled by -1', () => {
    expect(scaleVec3([1, 2, 3], -1)).toStrictEqual([-1, -2, -3])
  })
})

describe('mirrorXVec3', () => {
  it('negates the X component and preserves Y and Z', () => {
    expect(mirrorXVec3([3, 4, 5])).toStrictEqual([-3, 4, 5])
  })

  it('double mirror returns the original', () => {
    const v: Vec3 = [1.5, -2.5, 3.5]
    expect(mirrorXVec3(mirrorXVec3(v))).toStrictEqual(v)
  })
})

describe('isVec3', () => {
  it('returns true for a valid Vec3', () => {
    expect(isVec3([1, 2, 3])).toBe(true)
  })

  it('returns true for zero vector', () => {
    expect(isVec3([0, 0, 0])).toBe(true)
  })

  it('returns true for negative and decimal values', () => {
    expect(isVec3([-1.5, 0.001, 999.9])).toBe(true)
  })

  it('returns false for non-array', () => {
    expect(isVec3('not an array')).toBe(false)
    expect(isVec3(42)).toBe(false)
    expect(isVec3(null)).toBe(false)
    expect(isVec3(undefined)).toBe(false)
  })

  it('returns false for wrong length', () => {
    expect(isVec3([1, 2])).toBe(false)
    expect(isVec3([1, 2, 3, 4])).toBe(false)
    expect(isVec3([])).toBe(false)
  })

  it('returns false for non-number elements', () => {
    expect(isVec3([1, 'two', 3])).toBe(false)
    expect(isVec3([1, null, 3])).toBe(false)
  })

  it('returns false for NaN and Infinity', () => {
    expect(isVec3([NaN, 0, 0])).toBe(false)
    expect(isVec3([0, Infinity, 0])).toBe(false)
    expect(isVec3([0, 0, -Infinity])).toBe(false)
  })
})
