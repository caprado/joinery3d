import { describe, it, expect } from 'vitest'
import { initialState } from './state'
import type { AppState } from './state'

describe('initialState', () => {
  it('is a valid AppState', () => {
    const state: AppState = initialState
    expect(state).toBeDefined()
  })

  it('has an empty library', () => {
    expect(Object.keys(initialState.library.templates)).toHaveLength(0)
    expect(Object.keys(initialState.library.parts)).toHaveLength(0)
    expect(Object.keys(initialState.library.textures)).toHaveLength(0)
  })

  it('has no current instance or project path', () => {
    expect(initialState.currentInstance).toBeUndefined()
    expect(initialState.currentProjectPath).toBeUndefined()
    expect(initialState.libraryPath).toBeUndefined()
  })

  it('starts with no selection', () => {
    expect(initialState.selection).toStrictEqual({ kind: 'none' })
  })

  it('defaults to translate tool mode', () => {
    expect(initialState.toolMode).toBe('translate')
  })

  it('has grid visible by default', () => {
    expect(initialState.viewOptions.showGrid).toBe(true)
    expect(initialState.viewOptions.ps1Effects).toBe(false)
    expect(initialState.viewOptions.wireframe).toBe(false)
  })

  it('has snap disabled by default with correct increments', () => {
    expect(initialState.editorOptions.snapEnabled).toBe(false)
    expect(initialState.editorOptions.snapTranslation).toBe(0.05)
    expect(initialState.editorOptions.snapRotation).toBeCloseTo(0.0872665)
    expect(initialState.editorOptions.snapScale).toBe(0.1)
    expect(initialState.editorOptions.mirrorEnabled).toBe(false)
  })

  it('starts with empty history', () => {
    expect(initialState.history.past).toHaveLength(0)
    expect(initialState.history.future).toHaveLength(0)
    expect(initialState.history.limit).toBe(50)
  })

  it('is not dirty', () => {
    expect(initialState.dirty).toBe(false)
  })
})
