import { describe, it, expect } from 'vitest'
import { assertNever } from './assert-never'

describe('assertNever', () => {
  it('throws with a descriptive message', () => {
    expect(() => assertNever('unexpected' as never)).toThrow('Unhandled case: "unexpected"')
  })

  it('includes the value in the error for objects', () => {
    expect(() => assertNever({ kind: 'unknown' } as never)).toThrow(
      'Unhandled case: {"kind":"unknown"}',
    )
  })
})
