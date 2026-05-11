import { describe, it, expect, vi } from 'vitest'
import { tap } from './tap'

describe('tap', () => {
  it('calls the function with the value', () => {
    const spy = vi.fn()
    tap(spy)(42)
    expect(spy).toHaveBeenCalledWith(42)
  })

  it('returns the original value unchanged', () => {
    const result = tap(() => undefined)(42)
    expect(result).toBe(42)
  })

  it('works in a pipeline by calling the side effect for each element', () => {
    const spy = vi.fn()
    const result = [1, 2, 3].map(tap(spy))
    expect(result).toStrictEqual([1, 2, 3])
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy).toHaveBeenNthCalledWith(1, 1)
    expect(spy).toHaveBeenNthCalledWith(2, 2)
    expect(spy).toHaveBeenNthCalledWith(3, 3)
  })
})
