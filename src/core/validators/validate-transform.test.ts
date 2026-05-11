import { describe, it, expect } from 'vitest'
import { isOk, isErr } from '../fp/result-ops'
import { validateTransform } from './validate-transform'

describe('validateTransform', () => {
  it('accepts a valid transform with numeric scale', () => {
    const result = validateTransform(
      { position: [1, 2, 3], rotation: [0.1, 0.2, 0.3], scale: 2 },
      'test',
    )
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.position).toStrictEqual([1, 2, 3])
      expect(result.value.rotation).toStrictEqual([0.1, 0.2, 0.3])
      expect(result.value.scale).toBe(2)
    }
  })

  it('accepts a valid transform with Vec3 scale', () => {
    const result = validateTransform(
      { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 2, 3] },
      'test',
    )
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.scale).toStrictEqual([1, 2, 3])
    }
  })

  it('rejects non-object', () => {
    const result = validateTransform('not an object', 'test')
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('test')
      expect(result.error.message).toBe('Expected an object')
    }
  })

  it('rejects null', () => {
    const result = validateTransform(null, 'test')
    expect(isErr(result)).toBe(true)
  })

  it('rejects invalid position with nested path', () => {
    const result = validateTransform(
      { position: 'bad', rotation: [0, 0, 0], scale: 1 },
      'transform',
    )
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('transform.position')
    }
  })

  it('rejects invalid rotation with nested path', () => {
    const result = validateTransform(
      { position: [0, 0, 0], rotation: [0, 'bad', 0], scale: 1 },
      'transform',
    )
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('transform.rotation[1]')
    }
  })

  it('rejects invalid scale that is neither number nor Vec3', () => {
    const result = validateTransform(
      { position: [0, 0, 0], rotation: [0, 0, 0], scale: 'big' },
      'transform',
    )
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.path).toBe('transform.scale')
      expect(result.error.message).toBe('Expected a finite number or a Vec3')
    }
  })

  it('rejects NaN scale', () => {
    const result = validateTransform(
      { position: [0, 0, 0], rotation: [0, 0, 0], scale: NaN },
      'test',
    )
    expect(isErr(result)).toBe(true)
  })

  it('rejects Infinity scale', () => {
    const result = validateTransform(
      { position: [0, 0, 0], rotation: [0, 0, 0], scale: Infinity },
      'test',
    )
    expect(isErr(result)).toBe(true)
  })

  it('includes received value in error', () => {
    const result = validateTransform(42, 'test')
    expect(isErr(result)).toBe(true)
    if (!result.ok) {
      expect(result.error.received).toBe(42)
    }
  })
})
