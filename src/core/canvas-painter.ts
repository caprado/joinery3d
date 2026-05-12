export type PainterTool = 'brush' | 'eraser' | 'fill'

export type PainterColor = {
  readonly red: number
  readonly green: number
  readonly blue: number
  readonly alpha: number
}

export type CanvasSnapshot = {
  readonly data: readonly number[]
  readonly width: number
  readonly height: number
}

export type PainterState = {
  readonly width: number
  readonly height: number
  readonly activeTool: PainterTool
  readonly brushSize: number
  readonly color: PainterColor
  readonly undoStack: readonly CanvasSnapshot[]
  readonly redoStack: readonly CanvasSnapshot[]
  readonly undoLimit: number
}

export const createPainterState = (width: number, height: number): PainterState => ({
  width,
  height,
  activeTool: 'brush',
  brushSize: 4,
  color: { red: 0, green: 0, blue: 0, alpha: 255 },
  undoStack: [],
  redoStack: [],
  undoLimit: 30,
})

export const setActiveTool = (state: PainterState, tool: PainterTool): PainterState => ({
  ...state,
  activeTool: tool,
})

export const setBrushSize = (state: PainterState, size: number): PainterState => ({
  ...state,
  brushSize: Math.max(1, Math.round(size)),
})

export const setColor = (state: PainterState, color: PainterColor): PainterState => ({
  ...state,
  color,
})

export const pushUndoSnapshot = (
  state: PainterState,
  snapshot: CanvasSnapshot,
): PainterState => ({
  ...state,
  undoStack:
    state.undoStack.length >= state.undoLimit
      ? [...state.undoStack.slice(1), snapshot]
      : [...state.undoStack, snapshot],
  redoStack: [],
})

export const canUndo = (state: PainterState): boolean => state.undoStack.length > 0

export const canRedo = (state: PainterState): boolean => state.redoStack.length > 0

export const popUndo = (
  state: PainterState,
  currentSnapshot: CanvasSnapshot,
): { readonly state: PainterState; readonly snapshot: CanvasSnapshot } | undefined => {
  const lastEntry = state.undoStack[state.undoStack.length - 1]
  if (lastEntry === undefined) return undefined

  return {
    state: {
      ...state,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [currentSnapshot, ...state.redoStack],
    },
    snapshot: lastEntry,
  }
}

export const popRedo = (
  state: PainterState,
  currentSnapshot: CanvasSnapshot,
): { readonly state: PainterState; readonly snapshot: CanvasSnapshot } | undefined => {
  const nextEntry = state.redoStack[0]
  if (nextEntry === undefined) return undefined

  return {
    state: {
      ...state,
      redoStack: state.redoStack.slice(1),
      undoStack: [...state.undoStack, currentSnapshot],
    },
    snapshot: nextEntry,
  }
}
