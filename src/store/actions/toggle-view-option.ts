import type { AppState, ViewOptions } from '../state'

export const toggleViewOption = (state: AppState, option: keyof ViewOptions): AppState => ({
  ...state,
  viewOptions: {
    ...state.viewOptions,
    [option]: !state.viewOptions[option],
  },
})
