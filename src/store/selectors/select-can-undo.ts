import type { AppState } from '../state'

export const selectCanUndo = (state: AppState): boolean => state.history.past.length > 0
