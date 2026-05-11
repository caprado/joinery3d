import { describe, it, expect } from 'vitest'
import { compose } from './compose'

describe('compose', () => {
  it('composes a single function', () => {
    const double = compose((n: number) => n * 2)
    expect(double(5)).toBe(10)
  })

  it('composes two functions right to left', () => {
    const addOneThenDouble = compose(
      (n: number) => n * 2,
      (n: number) => n + 1,
    )
    expect(addOneThenDouble(5)).toBe(12)
  })

  it('composes three functions right to left', () => {
    const fn = compose(
      (n: number) => String(n),
      (n: number) => n + 1,
      (n: number) => n * 2,
    )
    expect(fn(5)).toBe('11')
  })

  it('composes four functions right to left', () => {
    const fn = compose(
      (n: number) => n + 100,
      (n: number) => n * 3,
      (n: number) => n + 1,
      (n: number) => n * 2,
    )
    expect(fn(5)).toBe(133)
  })
})
