import { describe, it, expect } from 'vitest'
import { ok, err } from './result'

describe('ok', () => {
  it('creates a success result with the given value', () => {
    const result = ok(42)
    expect(result).toStrictEqual({ ok: true, value: 42 })
  })

  it('preserves complex values', () => {
    const result = ok({ name: 'test', items: [1, 2, 3] })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toStrictEqual({ name: 'test', items: [1, 2, 3] })
    }
  })
})

describe('err', () => {
  it('creates a failure result with the given error', () => {
    const result = err('something went wrong')
    expect(result).toStrictEqual({ ok: false, error: 'something went wrong' })
  })

  it('preserves structured errors', () => {
    const result = err({ code: 404, message: 'not found' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toStrictEqual({ code: 404, message: 'not found' })
    }
  })
})
