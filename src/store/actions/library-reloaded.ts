import type { LibraryIndex } from '../../schema/library'
import type { AppState } from '../state'

export const libraryReloaded = (state: AppState, library: LibraryIndex): AppState => ({
  ...state,
  library,
})
