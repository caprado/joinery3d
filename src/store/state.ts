import type { SlotTag } from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { LibraryIndex } from '../schema/library'
import { emptyLibrary } from '../schema/library'
import type { HistoryState } from '../core/history'
import { emptyHistory } from '../core/history'
import type { RecentProjectsList } from '../core/recent-projects'

export type Selection = { readonly kind: 'none' } | { readonly kind: 'slot'; readonly slotTag: SlotTag }

export type ToolMode = 'translate' | 'rotate' | 'scale'

export type BackgroundMode =
  | { readonly kind: 'solid'; readonly color: string }
  | { readonly kind: 'gradient'; readonly topColor: string; readonly bottomColor: string }
  | { readonly kind: 'skybox'; readonly imageUrl: string }

export type ViewOptions = {
  readonly showGrid: boolean
  readonly ps1Effects: boolean
  readonly wireframe: boolean
  readonly brightness: number
  readonly background: BackgroundMode
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
  readonly recentProjects: RecentProjectsList
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
    brightness: 1.0,
    background: { kind: 'solid', color: '#1a1a1a' },
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
  recentProjects: [],
}
