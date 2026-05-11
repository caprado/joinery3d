import type { AppState, EditorOptions } from '../state'

export const setEditorOption = (state: AppState, options: Partial<EditorOptions>): AppState => ({
  ...state,
  editorOptions: {
    ...state.editorOptions,
    ...options,
  },
})
