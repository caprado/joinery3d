import { describe, it, expect } from 'vitest'
import { pipe } from './pipe'

describe('pipe', () => {
  it('returns the value when no functions are provided', () => {
    expect(pipe(5)).toBe(5)
  })

  it('applies a single function', () => {
    expect(pipe(5, (n) => n * 2)).toBe(10)
  })

  it('applies functions left to right', () => {
    const result = pipe(
      5,
      (n) => n * 2,
      (n) => n + 1,
      (n) => String(n),
    )
    expect(result).toBe('11')
  })

  it('works with type transformations across steps', () => {
    const result = pipe(
      'hello',
      (s) => s.length,
      (n) => n > 3,
    )
    expect(result).toBe(true)
  })

  it('supports up to five functions', () => {
    const result = pipe(
      1,
      (n) => n + 1,
      (n) => n + 1,
      (n) => n + 1,
      (n) => n + 1,
      (n) => n + 1,
    )
    expect(result).toBe(6)
  })
})
