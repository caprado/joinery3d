import { popRedo } from '../../core/history'
import type { AppState, UndoableSnapshot } from '../state'

const takeSnapshot = (state: AppState): UndoableSnapshot => ({
  currentInstance: state.currentInstance,
  dirty: state.dirty,
})

export const redo = (state: AppState): AppState => {
  const result = popRedo(state.history, takeSnapshot(state))
  if (result === undefined) return state

  return {
    ...state,
    currentInstance: result.snapshot.currentInstance,
    dirty: result.snapshot.dirty,
    history: result.history,
  }
}
