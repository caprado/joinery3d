import type { JSX } from 'preact'
import { useRef, useEffect } from 'preact/hooks'
import type { StoreApi } from 'zustand/vanilla'
import type { Store } from '../../store/store'
import type { FsAdapter } from '../../shell/fs/adapter'
import { useAppStore } from '../../store/use-app-store'
import { selectSelectedSlotTag } from '../../store/selectors/select-selected-slot-tag'
import { selectAvailablePartsForSelection } from '../../store/selectors/select-available-parts-for-selection'
import { selectCanUndo } from '../../store/selectors/select-can-undo'
import { selectCanRedo } from '../../store/selectors/select-can-redo'
import { slotTag, partId } from '../../schema/ids'
import { findTemplate } from '../../schema/library'
import { createViewport } from '../../viewport/viewport'
import { useKeyboardShortcuts } from '../use-keyboard-shortcuts'
import { Topbar } from '../topbar'
import { SlotList } from '../slot-list'
import { LibraryPanel } from '../library-panel'
import { RightSidebar } from './right-sidebar'
import { ViewOptionsBar } from './view-options-bar'

export type WorkspaceViewProps = {
  readonly store: StoreApi<Store>
  readonly adapter: FsAdapter
  readonly onNewAsset: () => void
  readonly onCreatePart: () => void
  readonly onNewTemplate: () => void
  readonly onOpenProject: () => void
  readonly onCloseProject: () => void
  readonly onSave: () => void
  readonly onSaveAs: () => void
  readonly onExport: () => void
}

export const WorkspaceView = (props: WorkspaceViewProps): JSX.Element => {
  const viewportContainerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<{ dispose: () => void; resetCamera: () => void } | undefined>(undefined)

  const library = useAppStore(props.store, (state) => state.library)
  const currentInstance = useAppStore(props.store, (state) => state.currentInstance)
  const isDirty = useAppStore(props.store, (state) => state.dirty)
  const projectPath = useAppStore(props.store, (state) => state.currentProjectPath)
  const canUndo = useAppStore(props.store, selectCanUndo)
  const canRedo = useAppStore(props.store, selectCanRedo)
  const selectedSlotTag = useAppStore(props.store, selectSelectedSlotTag)
  const availableParts = useAppStore(props.store, selectAvailablePartsForSelection)

  const template = currentInstance !== undefined
    ? findTemplate(library, currentInstance.templateId)
    : undefined

  useEffect(() => {
    const container = viewportContainerRef.current
    if (container === null) return undefined

    const frameId = requestAnimationFrame(() => {
      const viewportInstance = createViewport(props.store, props.adapter)
      viewportInstance.mount(container)
      viewportRef.current = viewportInstance
    })

    return () => {
      cancelAnimationFrame(frameId)
      viewportRef.current?.dispose()
      viewportRef.current = undefined
    }
  }, [props.store, props.adapter])

  useKeyboardShortcuts({
    onUndo: () => { props.store.getState().undo() },
    onRedo: () => { props.store.getState().redo() },
  })

  return (
    <div class="app">
      <Topbar
        onNewAsset={props.onNewAsset}
        onCreatePart={props.onCreatePart}
        onOpenProject={props.onOpenProject}
        onCloseProject={props.onCloseProject}
        onSave={props.onSave}
        onSaveAs={props.onSaveAs}
        onExport={props.onExport}
        onUndo={() => { props.store.getState().undo() }}
        onRedo={() => { props.store.getState().redo() }}
        hasInstance={currentInstance !== undefined}
        isDirty={isDirty}
        hasProjectPath={projectPath !== undefined}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <main class="app-main">
        <aside class="app-sidebar-left">
          {template !== undefined && currentInstance !== undefined && (
            <SlotList
              slots={template.slots}
              assignments={currentInstance.slots}
              parts={library.parts}
              selectedSlotTag={selectedSlotTag?.value}
              onSlotSelected={(tag) => {
                props.store.getState().setSelection({
                  kind: 'slot',
                  slotTag: slotTag(tag),
                })
              }}
            />
          )}
          <LibraryPanel
            availableParts={availableParts}
            library={library}
            onPartSelected={(selectedPartId) => {
              if (selectedSlotTag !== undefined) {
                props.store.getState().setSlotPart(
                  selectedSlotTag,
                  partId(selectedPartId),
                )
              }
            }}
          />
        </aside>
        <div class="app-viewport-wrapper">
          <ViewOptionsBar
            store={props.store}
            onResetCamera={() => { viewportRef.current?.resetCamera() }}
          />
          <div
            class="app-viewport"
            ref={viewportContainerRef}
          />
        </div>
        <RightSidebar store={props.store} />
      </main>
    </div>
  )
}
