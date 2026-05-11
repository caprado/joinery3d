import type { AppState } from '../state'

export const redo = (state: AppState): AppState => {
  const nextEntry = state.history.future[0]
  if (nextEntry === undefined) return state

  return {
    ...state,
    ...nextEntry.previousState,
    history: {
      ...state.history,
      future: state.history.future.slice(1),
      past: [
        ...state.history.past,
        { label: nextEntry.label, previousState: extractUndoableState(state) },
      ],
    },
  }
}

const extractUndoableState = (state: AppState): Partial<AppState> => ({
  currentInstance: state.currentInstance,
  dirty: state.dirty,
})
