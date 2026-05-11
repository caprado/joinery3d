import { describe, it, expect } from 'vitest'
import { type Result, ok, err } from './result'
import {
  mapResult,
  flatMapResult,
  mapErrResult,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
} from './result-ops'

describe('mapResult', () => {
  it('applies the function to an Ok value', () => {
    const result = mapResult((n: number) => n * 2)(ok(5))
    expect(result).toStrictEqual(ok(10))
  })

  it('passes through an Err unchanged', () => {
    const result = mapResult((n: number) => n * 2)(err('fail'))
    expect(result).toStrictEqual(err('fail'))
  })
})

describe('flatMapResult', () => {
  it('chains a function that returns Ok', () => {
    const safeDivide = (n: number): Result<number, string> =>
      n === 0 ? err('div by zero') : ok(100 / n)
    const result = flatMapResult(safeDivide)(ok(5))
    expect(result).toStrictEqual(ok(20))
  })

  it('chains a function that returns Err', () => {
    const safeDivide = (n: number): Result<number, string> =>
      n === 0 ? err('div by zero') : ok(100 / n)
    const result = flatMapResult(safeDivide)(ok(0))
    expect(result).toStrictEqual(err('div by zero'))
  })

  it('passes through an existing Err', () => {
    const safeDivide = (n: number): Result<number, string> =>
      n === 0 ? err('div by zero') : ok(100 / n)
    const result = flatMapResult(safeDivide)(err('already broken'))
    expect(result).toStrictEqual(err('already broken'))
  })
})

describe('mapErrResult', () => {
  it('applies the function to an Err', () => {
    const result = mapErrResult((e: string) => `wrapped: ${e}`)(err('oops'))
    expect(result).toStrictEqual(err('wrapped: oops'))
  })

  it('passes through an Ok unchanged', () => {
    const result = mapErrResult((e: string) => `wrapped: ${e}`)(ok(42))
    expect(result).toStrictEqual(ok(42))
  })
})

describe('isOk', () => {
  it('returns true for Ok', () => {
    expect(isOk(ok(1))).toBe(true)
  })

  it('returns false for Err', () => {
    expect(isOk(err('fail'))).toBe(false)
  })
})

describe('isErr', () => {
  it('returns true for Err', () => {
    expect(isErr(err('fail'))).toBe(true)
  })

  it('returns false for Ok', () => {
    expect(isErr(ok(1))).toBe(false)
  })
})

describe('unwrap', () => {
  it('returns the value from Ok', () => {
    expect(unwrap(ok(42))).toBe(42)
  })

  it('throws for Err', () => {
    expect(() => unwrap(err('bad'))).toThrow('Called unwrap on an Err: bad')
  })
})

describe('unwrapOr', () => {
  it('returns the value from Ok', () => {
    expect(unwrapOr(0)(ok(42))).toBe(42)
  })

  it('returns the fallback for Err', () => {
    expect(unwrapOr(0)(err('bad'))).toBe(0)
  })
})
