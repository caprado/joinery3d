import type { AppState } from '../state'

export const instanceClosed = (state: AppState): AppState => ({
  ...state,
  currentInstance: undefined,
  currentProjectPath: undefined,
  selection: { kind: 'none' },
  dirty: false,
  history: { ...state.history, past: [], future: [] },
})
