import type { LibraryIndex } from '../../schema/library'
import type { AppState } from '../state'

export const libraryLoaded = (
  state: AppState,
  library: LibraryIndex,
  path: string,
): AppState => ({
  ...state,
  library,
  libraryPath: path,
})
