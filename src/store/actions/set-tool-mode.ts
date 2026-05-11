import type { AppState, ToolMode } from '../state'

export const setToolMode = (state: AppState, mode: ToolMode): AppState => ({
  ...state,
  toolMode: mode,
})
