import type { AssetInstance } from '../../schema/instance'
import type { AppState } from '../state'

export const instanceLoaded = (
  state: AppState,
  instance: AssetInstance,
  path: string,
): AppState => ({
  ...state,
  currentInstance: instance,
  currentProjectPath: path,
  selection: { kind: 'none' },
  dirty: false,
  history: { ...state.history, past: [], future: [] },
})
