import type { AppState } from '../state'

export const instanceRenamed = (state: AppState, name: string): AppState => {
  if (state.currentInstance === undefined) return state
  return {
    ...state,
    currentInstance: { ...state.currentInstance, name },
    dirty: true,
  }
}
