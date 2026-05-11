import type { AssetInstance } from '../../schema/instance'
import type { AppState } from '../state'

export const instanceCreated = (state: AppState, instance: AssetInstance): AppState => ({
  ...state,
  currentInstance: instance,
  currentProjectPath: undefined,
  selection: { kind: 'none' },
  dirty: false,
  history: { ...state.history, past: [], future: [] },
})
