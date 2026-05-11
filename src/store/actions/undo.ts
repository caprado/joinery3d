import type { AppState } from '../state'

export const undo = (state: AppState): AppState => {
  const lastEntry = state.history.past[state.history.past.length - 1]
  if (lastEntry === undefined) return state

  return {
    ...state,
    ...lastEntry.previousState,
    history: {
      ...state.history,
      past: state.history.past.slice(0, -1),
      future: [
        { label: lastEntry.label, previousState: extractUndoableState(state) },
        ...state.history.future,
      ],
    },
  }
}

const extractUndoableState = (state: AppState): Partial<AppState> => ({
  currentInstance: state.currentInstance,
  dirty: state.dirty,
})
