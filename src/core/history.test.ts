import { describe, it, expect } from 'vitest'
import { emptyHistory, pushHistory, popUndo, popRedo } from './history'

type TestSnapshot = { readonly value: string }

describe('pushHistory', () => {
  it('adds an entry to the past', () => {
    const history = emptyHistory<TestSnapshot>(50)
    const result = pushHistory(history, 'test action', { value: 'a' })
    expect(result.past).toHaveLength(1)
    expect(result.past[0]?.label).toBe('test action')
    expect(result.past[0]?.previousState.value).toBe('a')
  })

  it('clears the future on push', () => {
    const history = {
      ...emptyHistory<TestSnapshot>(50),
      future: [{ label: 'old', previousState: { value: 'x' } }],
    }
    const result = pushHistory(history, 'new action', { value: 'b' })
    expect(result.future).toHaveLength(0)
  })

  it('respects the limit by dropping oldest entry', () => {
    const history = emptyHistory<TestSnapshot>(3)
    const h1 = pushHistory(history, 'action 1', { value: '1' })
    const h2 = pushHistory(h1, 'action 2', { value: '2' })
    const h3 = pushHistory(h2, 'action 3', { value: '3' })
    expect(h3.past).toHaveLength(3)

    const h4 = pushHistory(h3, 'action 4', { value: '4' })
    expect(h4.past).toHaveLength(3)
    expect(h4.past[0]?.label).toBe('action 2')
    expect(h4.past[2]?.label).toBe('action 4')
  })
})

describe('popUndo', () => {
  it('returns undefined for empty history', () => {
    const history = emptyHistory<TestSnapshot>(50)
    expect(popUndo(history, { value: 'current' })).toBeUndefined()
  })

  it('returns the last snapshot and moves current to future', () => {
    const history = pushHistory(emptyHistory<TestSnapshot>(50), 'action', { value: 'before' })
    const result = popUndo(history, { value: 'after' })

    expect(result).toBeDefined()
    expect(result?.snapshot.value).toBe('before')
    expect(result?.history.past).toHaveLength(0)
    expect(result?.history.future).toHaveLength(1)
    expect(result?.history.future[0]?.previousState.value).toBe('after')
  })
})

describe('popRedo', () => {
  it('returns undefined for empty future', () => {
    const history = emptyHistory<TestSnapshot>(50)
    expect(popRedo(history, { value: 'current' })).toBeUndefined()
  })

  it('returns the next snapshot and moves current to past', () => {
    const history = pushHistory(emptyHistory<TestSnapshot>(50), 'action', { value: 'original' })
    const afterUndo = popUndo(history, { value: 'modified' })
    expect(afterUndo).toBeDefined()
    if (afterUndo === undefined) return

    const result = popRedo(afterUndo.history, { value: 'original' })
    expect(result).toBeDefined()
    expect(result?.snapshot.value).toBe('modified')
    expect(result?.history.future).toHaveLength(0)
    expect(result?.history.past).toHaveLength(1)
  })
})
