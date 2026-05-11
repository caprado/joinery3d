import { describe, it, expect } from 'vitest'
import { isOk, isErr } from '../fp/result-ops'
import { validateTexture } from './validate-texture'

const validTexture = {
  id: 'skin_pale',
  name: 'Pale Skin',
  file: 'textures/skin_pale.png',
  width: 128,
  height: 128,
  tags: ['skin', 'human'],
}

describe('validateTexture', () => {
  it('accepts a valid texture', () => {
    const result = validateTexture(validTexture, 'root')
    expect(isOk(result)).toBe(true)
    if (result.ok) {
      expect(result.value.id.value).toBe('skin_pale')
      expect(result.value.width).toBe(128)
      expect(result.value.tags).toStrictEqual(['skin', 'human'])
    }
  })

  it('rejects non-object', () => {
    const result = validateTexture(42, 'root')
    expect(isErr(result)).toBe(true)
  })

  it('rejects missing name', () => {
    const result = validateTexture({ ...validTexture, name: 123 }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.name')
  })

  it('rejects non-positive width', () => {
    const result = validateTexture({ ...validTexture, width: 0 }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.width')
  })

  it('rejects non-integer height', () => {
    const result = validateTexture({ ...validTexture, height: 12.5 }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.height')
  })

  it('rejects non-string tag in array', () => {
    const result = validateTexture({ ...validTexture, tags: ['ok', 42] }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.tags[1]')
  })

  it('rejects non-array tags', () => {
    const result = validateTexture({ ...validTexture, tags: 'bad' }, 'root')
    expect(isErr(result)).toBe(true)
    if (!result.ok) expect(result.error.path).toBe('root.tags')
  })
})
