import { describe, it, expect } from 'vitest'
import type { CanvasSnapshot } from './canvas-painter'
import {
  createPainterState,
  setActiveTool,
  setBrushSize,
  setColor,
  pushUndoSnapshot,
  canUndo,
  canRedo,
  popUndo,
  popRedo,
} from './canvas-painter'

const createMockSnapshot = (): CanvasSnapshot => ({
  data: Array.from({ length: 64 }, () => 0),
  width: 4,
  height: 4,
})

describe('createPainterState', () => {
  it('creates state with given dimensions', () => {
    const state = createPainterState(64, 64)
    expect(state.width).toBe(64)
    expect(state.height).toBe(64)
  })

  it('defaults to brush tool', () => {
    const state = createPainterState(64, 64)
    expect(state.activeTool).toBe('brush')
  })

  it('starts with empty undo/redo stacks', () => {
    const state = createPainterState(64, 64)
    expect(state.undoStack).toHaveLength(0)
    expect(state.redoStack).toHaveLength(0)
  })
})

describe('setActiveTool', () => {
  it('changes the active tool', () => {
    const state = createPainterState(64, 64)
    const updated = setActiveTool(state, 'eraser')
    expect(updated.activeTool).toBe('eraser')
  })
})

describe('setBrushSize', () => {
  it('sets the brush size', () => {
    const state = createPainterState(64, 64)
    const updated = setBrushSize(state, 8)
    expect(updated.brushSize).toBe(8)
  })

  it('clamps to minimum of 1', () => {
    const state = createPainterState(64, 64)
    const updated = setBrushSize(state, 0)
    expect(updated.brushSize).toBe(1)
  })
})

describe('setColor', () => {
  it('sets the color', () => {
    const state = createPainterState(64, 64)
    const updated = setColor(state, { red: 255, green: 0, blue: 128, alpha: 200 })
    expect(updated.color.red).toBe(255)
    expect(updated.color.blue).toBe(128)
    expect(updated.color.alpha).toBe(200)
  })
})

describe('undo/redo', () => {
  it('pushUndoSnapshot adds to undo stack', () => {
    const state = createPainterState(64, 64)
    const snapshot = createMockSnapshot()
    const updated = pushUndoSnapshot(state, snapshot)
    expect(updated.undoStack).toHaveLength(1)
    expect(canUndo(updated)).toBe(true)
  })

  it('pushUndoSnapshot clears redo stack', () => {
    const state = createPainterState(64, 64)
    const snapshot1 = createMockSnapshot()
    const withUndo = pushUndoSnapshot(state, snapshot1)
    const currentSnapshot = createMockSnapshot()
    const afterUndo = popUndo(withUndo, currentSnapshot)
    expect(afterUndo).toBeDefined()
    if (afterUndo === undefined) return
    expect(canRedo(afterUndo.state)).toBe(true)

    const snapshot2 = createMockSnapshot()
    const afterNewAction = pushUndoSnapshot(afterUndo.state, snapshot2)
    expect(canRedo(afterNewAction)).toBe(false)
  })

  it('popUndo returns the last snapshot', () => {
    const state = createPainterState(64, 64)
    const snapshot = createMockSnapshot()
    const withUndo = pushUndoSnapshot(state, snapshot)
    const currentSnapshot = createMockSnapshot()
    const result = popUndo(withUndo, currentSnapshot)

    expect(result).toBeDefined()
    expect(result?.snapshot).toBe(snapshot)
    expect(result?.state.undoStack).toHaveLength(0)
    expect(result?.state.redoStack).toHaveLength(1)
  })

  it('popUndo returns undefined for empty stack', () => {
    const state = createPainterState(64, 64)
    expect(popUndo(state, createMockSnapshot())).toBeUndefined()
  })

  it('popRedo returns the next snapshot', () => {
    const state = createPainterState(64, 64)
    const snapshot = createMockSnapshot()
    const withUndo = pushUndoSnapshot(state, snapshot)
    const currentSnapshot = createMockSnapshot()
    const afterUndo = popUndo(withUndo, currentSnapshot)
    expect(afterUndo).toBeDefined()
    if (afterUndo === undefined) return

    const redoResult = popRedo(afterUndo.state, afterUndo.snapshot)
    expect(redoResult).toBeDefined()
    expect(redoResult?.snapshot).toBe(currentSnapshot)
  })

  it('popRedo returns undefined for empty stack', () => {
    const state = createPainterState(64, 64)
    expect(popRedo(state, createMockSnapshot())).toBeUndefined()
  })

  it('respects undo limit', () => {
    const state = { ...createPainterState(64, 64), undoLimit: 3 }
    const step1 = pushUndoSnapshot(state, createMockSnapshot())
    const step2 = pushUndoSnapshot(step1, createMockSnapshot())
    const step3 = pushUndoSnapshot(step2, createMockSnapshot())
    expect(step3.undoStack).toHaveLength(3)

    const step4 = pushUndoSnapshot(step3, createMockSnapshot())
    expect(step4.undoStack).toHaveLength(3)
  })
})
