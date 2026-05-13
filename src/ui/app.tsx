import './app.css'
import './animations/transitions.css'
import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import type { StoreApi } from 'zustand/vanilla'
import type { Store } from '../store/store'
import type { FsAdapter } from '../shell/fs/adapter'
import { useAppStore } from '../store/use-app-store'
import { scanLibrary } from '../shell/library/scan'
import { loadSampleLibrary } from '../shell/library/load-sample-library'
import { createInstanceFromTemplate } from '../core/create-instance'
import { findTemplate } from '../schema/library'
import { templateId } from '../schema/ids'
import { saveProject } from '../shell/project/save'
import { loadProject } from '../shell/project/load'
import { buildRenderDescription } from '../core/assembly'
import { exportGlb } from '../shell/gltf/export'
import { downloadFile } from '../shell/download-file'
import { WelcomeScreen } from './welcome'
import { WorkspaceView } from './workspace/workspace-view'
import { NewAssetModal } from './topbar/new-asset-modal'

export type AppProps = {
  readonly store: StoreApi<Store>
  readonly adapter: FsAdapter
}

export const App = (props: AppProps): JSX.Element => {
  const libraryPath = useAppStore(props.store, (state) => state.libraryPath)
  const library = useAppStore(props.store, (state) => state.library)
  const currentProjectPath = useAppStore(props.store, (state) => state.currentProjectPath)
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(true)

  const handleOpenLibrary = (): void => {
    void props.adapter.pickFolder().then((path) => {
      if (path === undefined) return
      void scanLibrary(path, props.adapter).then((scannedLibrary) => {
        props.store.getState().libraryLoaded(scannedLibrary, path)
      })
    })
  }

  const handleUseSampleLibrary = (): void => {
    const baseUrl: string = import.meta.env.BASE_URL
    const basePath = `${window.location.origin}${baseUrl}sample-library`
    void loadSampleLibrary(basePath).then((scannedLibrary) => {
      props.store.getState().libraryLoaded(scannedLibrary, basePath)
    })
  }

  const handleTemplateSelected = (selectedTemplateId: string): void => {
    const template = findTemplate(library, templateId(selectedTemplateId))
    if (template === undefined) return
    const instance = createInstanceFromTemplate(template, template.name)
    props.store.getState().instanceCreated(instance)
    setIsNewAssetModalOpen(false)
  }

  const handleSave = (): void => {
    const state = props.store.getState()
    if (state.currentInstance === undefined || currentProjectPath === undefined) return
    void saveProject(state.currentInstance, currentProjectPath, props.adapter).then(() => {
      props.store.getState().instanceSaved(currentProjectPath)
    })
  }

  const handleSaveAs = (): void => {
    const state = props.store.getState()
    if (state.currentInstance === undefined) return
    void props.adapter.pickFolder().then((folder) => {
      if (folder === undefined || state.currentInstance === undefined) return
      const path = `${folder}/${state.currentInstance.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
      void saveProject(state.currentInstance, path, props.adapter).then(() => {
        props.store.getState().instanceSaved(path)
      })
    })
  }

  const handleExport = (): void => {
    const state = props.store.getState()
    if (state.currentInstance === undefined || libraryPath === undefined) return
    const template = findTemplate(state.library, state.currentInstance.templateId)
    if (template === undefined) return
    const description = buildRenderDescription(state.currentInstance, template, state.library)
    void exportGlb(description, libraryPath, props.adapter, {
      embedTextures: true,
      bakeHierarchyFlat: false,
    }).then((glbData) => {
      const fileName = `${state.currentInstance?.name ?? 'export'}.glb`
      downloadFile(glbData, fileName, 'model/gltf-binary')
    })
  }

  const handleOpenProject = (): void => {
    void props.adapter.pickFile(['json']).then((filePath) => {
      if (filePath === undefined) return
      void loadProject(filePath, props.adapter).then((result) => {
        if (result.ok) {
          props.store.getState().instanceLoaded(result.value, filePath)
        }
      })
    })
  }

  if (libraryPath === undefined) {
    return (
      <WelcomeScreen
        onOpenLibrary={handleOpenLibrary}
        onUseSampleLibrary={handleUseSampleLibrary}
      />
    )
  }

  return (
    <>
      <WorkspaceView
        store={props.store}
        adapter={props.adapter}
        onNewAsset={() => { setIsNewAssetModalOpen(true) }}
        onNewTemplate={() => undefined}
        onOpenProject={handleOpenProject}
        onCloseProject={() => { props.store.getState().instanceClosed() }}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onExport={handleExport}
      />
      <NewAssetModal
        isOpen={isNewAssetModalOpen}
        templates={Object.values(library.templates)}
        onTemplateSelected={handleTemplateSelected}
        onClose={() => {
          setIsNewAssetModalOpen(false)
        }}
      />
    </>
  )
}
