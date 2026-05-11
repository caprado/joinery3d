import { describe, it, expect } from 'vitest'
import { isOk, isErr } from '../fp/result-ops'
import { validateVec3 } from './validate-vec3'

describe('validateVec3', () => {
  it('accepts a valid Vec3', () => {
    const result = validateVec3([1, 2, 3], 'test')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value).toStrictEqual([1, 2, 3])
    }
  })

  it('accepts zero vector', () => {
    const result = validateVec3([0, 0, 0], 'test')
    expect(isOk(result)).toBe(true)
  })

  it('accepts negative and decimal values', () => {
    const result = validateVec3([-1.5, 0.001, 999.9], 'test')
    expect(isOk(result)).toBe(true)
  })

  it('rejects non-array with path in error', () => {
    const result = validateVec3('not an array', 'position')
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('position')
      expect(result.error.message).toBe('Expected an array')
    }
  })

  it('rejects wrong length', () => {
    const result = validateVec3([1, 2], 'position')
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('position')
      expect(result.error.message).toBe('Expected array of length 3')
    }
  })

  it('rejects non-number at index 0 with indexed path', () => {
    const result = validateVec3(['a', 2, 3], 'position')
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('position[0]')
      expect(result.error.message).toBe('Expected a finite number')
    }
  })

  it('rejects non-number at index 1 with indexed path', () => {
    const result = validateVec3([1, null, 3], 'position')
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('position[1]')
    }
  })

  it('rejects non-number at index 2 with indexed path', () => {
    const result = validateVec3([1, 2, undefined], 'position')
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('position[2]')
    }
  })

  it('rejects NaN', () => {
    const result = validateVec3([NaN, 0, 0], 'position')
    expect(isErr(result)).toBe(true)
  })

  it('rejects Infinity', () => {
    const result = validateVec3([0, Infinity, 0], 'position')
    expect(isErr(result)).toBe(true)
  })

  it('includes the received value in the error', () => {
    const result = validateVec3(42, 'test')
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.received).toBe(42)
    }
  })
})
