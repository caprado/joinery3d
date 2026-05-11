import type { AppState } from '../state'

export const instanceSaved = (state: AppState, path: string): AppState => ({
  ...state,
  currentProjectPath: path,
  dirty: false,
})
