import type { SlotTag } from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { LibraryIndex } from '../schema/library'
import { emptyLibrary } from '../schema/library'
import type { HistoryState } from '../core/history'
import { emptyHistory } from '../core/history'

export type Selection = { readonly kind: 'none' } | { readonly kind: 'slot'; readonly slotTag: SlotTag }

export type ToolMode = 'translate' | 'rotate' | 'scale'

export type ViewOptions = {
  readonly showGrid: boolean
  readonly ps1Effects: boolean
  readonly wireframe: boolean
}

export type EditorOptions = {
  readonly snapEnabled: boolean
  readonly snapTranslation: number
  readonly snapRotation: number
  readonly snapScale: number
  readonly mirrorEnabled: boolean
}

export type UndoableSnapshot = {
  readonly currentInstance: AssetInstance | undefined
  readonly dirty: boolean
}

export type AppState = {
  readonly library: LibraryIndex
  readonly libraryPath: string | undefined
  readonly currentInstance: AssetInstance | undefined
  readonly currentProjectPath: string | undefined
  readonly selection: Selection
  readonly toolMode: ToolMode
  readonly viewOptions: ViewOptions
  readonly editorOptions: EditorOptions
  readonly history: HistoryState<UndoableSnapshot>
  readonly dirty: boolean
}

export const initialState: AppState = {
  library: emptyLibrary,
  libraryPath: undefined,
  currentInstance: undefined,
  currentProjectPath: undefined,
  selection: { kind: 'none' },
  toolMode: 'translate',
  viewOptions: {
    showGrid: true,
    ps1Effects: false,
    wireframe: false,
  },
  editorOptions: {
    snapEnabled: false,
    snapTranslation: 0.05,
    snapRotation: 0.0872665,
    snapScale: 0.1,
    mirrorEnabled: false,
  },
  history: emptyHistory(50),
  dirty: false,
}
