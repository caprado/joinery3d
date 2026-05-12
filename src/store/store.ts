import { createStore } from 'zustand/vanilla'
import type { PartId, SlotTag, TextureId } from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { LibraryIndex } from '../schema/library'
import type { TextureChannel } from '../schema/part'
import type { Transform } from '../schema/transform'
import { pushHistory } from '../core/history'
import type { AppState, EditorOptions, Selection, ToolMode, UndoableSnapshot, ViewOptions } from './state'
import { initialState } from './state'
import { libraryLoaded } from './actions/library-loaded'
import { libraryReloaded } from './actions/library-reloaded'
import { instanceCreated } from './actions/instance-created'
import { instanceLoaded } from './actions/instance-loaded'
import { instanceSaved } from './actions/instance-saved'
import { instanceRenamed } from './actions/instance-renamed'
import { setSlotPart } from './actions/set-slot-part'
import { setSlotOffset } from './actions/set-slot-offset'
import { resetSlotOffset } from './actions/reset-slot-offset'
import { setSlotTexture } from './actions/set-slot-texture'
import { savePartDefaultOffset } from './actions/save-part-default-offset'
import { setSelection } from './actions/set-selection'
import { setToolMode } from './actions/set-tool-mode'
import { toggleViewOption } from './actions/toggle-view-option'
import { setEditorOption } from './actions/set-editor-option'
import { updatePartMetadata } from './actions/update-part-metadata'
import type { PartMetadataUpdate } from './actions/update-part-metadata'
import { undo } from './actions/undo'
import { redo } from './actions/redo'

export type StoreActions = {
  readonly libraryLoaded: (library: LibraryIndex, path: string) => void
  readonly libraryReloaded: (library: LibraryIndex) => void
  readonly instanceCreated: (instance: AssetInstance) => void
  readonly instanceLoaded: (instance: AssetInstance, path: string) => void
  readonly instanceSaved: (path: string) => void
  readonly instanceRenamed: (name: string) => void
  readonly setSlotPart: (slotTagValue: SlotTag, partIdValue: PartId) => void
  readonly setSlotOffset: (slotTagValue: SlotTag, offset: Transform) => void
  readonly resetSlotOffset: (slotTagValue: SlotTag) => void
  readonly setSlotTexture: (
    slotTagValue: SlotTag,
    channel: TextureChannel,
    newTextureId: TextureId | undefined,
  ) => void
  readonly savePartDefaultOffset: (targetPartId: PartId, offset: Transform) => void
  readonly setSelection: (selection: Selection) => void
  readonly setToolMode: (mode: ToolMode) => void
  readonly toggleViewOption: (option: keyof ViewOptions) => void
  readonly setEditorOption: (options: Partial<EditorOptions>) => void
  readonly updatePartMetadata: (targetPartId: PartId, update: PartMetadataUpdate) => void
  readonly undo: () => void
  readonly redo: () => void
  readonly setRecentProjects: (projects: readonly string[]) => void
}

export type Store = AppState & StoreActions

const takeSnapshot = (state: AppState): UndoableSnapshot => ({
  currentInstance: state.currentInstance,
  dirty: state.dirty,
})

const withHistory = (
  state: AppState,
  label: string,
  action: (prevState: AppState) => AppState,
): AppState => {
  const stateWithHistory: AppState = {
    ...state,
    history: pushHistory(state.history, label, takeSnapshot(state)),
  }
  return action(stateWithHistory)
}

export const createAppStore = () =>
  createStore<Store>((set) => ({
    ...initialState,
    libraryLoaded: (library, path) => {
      set((state) => libraryLoaded(state, library, path))
    },
    libraryReloaded: (library) => {
      set((state) => libraryReloaded(state, library))
    },
    instanceCreated: (instance) => {
      set((state) => instanceCreated(state, instance))
    },
    instanceLoaded: (instance, path) => {
      set((state) => instanceLoaded(state, instance, path))
    },
    instanceSaved: (path) => {
      set((state) => instanceSaved(state, path))
    },
    instanceRenamed: (name) => {
      set((state) => withHistory(state, 'Rename', (prevState) => instanceRenamed(prevState, name)))
    },
    setSlotPart: (slotTagValue, partIdValue) => {
      set((state) => withHistory(state, 'Swap part', (prevState) => setSlotPart(prevState, slotTagValue, partIdValue)))
    },
    setSlotOffset: (slotTagValue, offset) => {
      set((state) => withHistory(state, 'Adjust offset', (prevState) => setSlotOffset(prevState, slotTagValue, offset)))
    },
    resetSlotOffset: (slotTagValue) => {
      set((state) => withHistory(state, 'Reset offset', (prevState) => resetSlotOffset(prevState, slotTagValue)))
    },
    setSlotTexture: (slotTagValue, channel, newTextureId) => {
      set((state) => withHistory(state, 'Change texture', (prevState) => setSlotTexture(prevState, slotTagValue, channel, newTextureId)))
    },
    savePartDefaultOffset: (targetPartId, offset) => {
      set((state) => withHistory(state, 'Save part default', (prevState) => savePartDefaultOffset(prevState, targetPartId, offset)))
    },
    setSelection: (selection) => {
      set((state) => setSelection(state, selection))
    },
    setToolMode: (mode) => {
      set((state) => setToolMode(state, mode))
    },
    toggleViewOption: (option) => {
      set((state) => toggleViewOption(state, option))
    },
    setEditorOption: (options) => {
      set((state) => setEditorOption(state, options))
    },
    updatePartMetadata: (targetPartId, update) => {
      set((state) => updatePartMetadata(state, targetPartId, update))
    },
    undo: () => {
      set((state) => undo(state))
    },
    redo: () => {
      set((state) => redo(state))
    },
    setRecentProjects: (projects) => {
      set((state) => ({ ...state, recentProjects: projects }))
    },
  }))
