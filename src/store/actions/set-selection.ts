import type { AppState, Selection } from '../state'

export const setSelection = (state: AppState, selection: Selection): AppState => ({
  ...state,
  selection,
})
