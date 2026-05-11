import type { AppState } from '../state'

export const selectCanRedo = (state: AppState): boolean => state.history.future.length > 0
