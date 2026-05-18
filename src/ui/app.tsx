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
import { templateId, partId, slotTag } from '../schema/ids'
import type { PartId } from '../schema/ids'
import type { Part } from '../schema/part'
import { saveProject } from '../shell/project/save'
import { loadProject } from '../shell/project/load'
import { buildRenderDescription } from '../core/assembly'
import { exportGlb } from '../shell/gltf/export'
import { downloadFile } from '../shell/download-file'
import { generatePrimitiveGlb } from '../shell/gltf/generate-primitive'
import { importPart } from '../shell/library/import-part'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { inspectGlb } from '../shell/gltf/inspect'
import type { MeshInfo } from '../shell/gltf/inspect'
import { saveTemplate } from '../shell/library/save-template'
import { WelcomeScreen } from './welcome'
import { WorkspaceView } from './workspace/workspace-view'
import { NewAssetModal } from './topbar/new-asset-modal'
import { PartCreatorModal } from './part-creator/part-creator-modal'
import type { PartCreatorResult } from './part-creator/part-creator-modal'
import { NewTemplateWizard } from './topbar/new-template-wizard'
import type { SlotConfig } from './topbar/new-template-wizard'

export type AppProps = {
  readonly store: StoreApi<Store>
  readonly adapter: FsAdapter
}

export const App = (props: AppProps): JSX.Element => {
  const libraryPath = useAppStore(props.store, (state) => state.libraryPath)
  const library = useAppStore(props.store, (state) => state.library)
  const currentProjectPath = useAppStore(props.store, (state) => state.currentProjectPath)
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(true)
  const [isPartCreatorOpen, setIsPartCreatorOpen] = useState(false)
  const [isTemplateWizardOpen, setIsTemplateWizardOpen] = useState(false)
  const [templateWizardMeshes, setTemplateWizardMeshes] = useState<readonly MeshInfo[]>([])

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

  const isReadOnlyLibrary = libraryPath !== undefined
    && (libraryPath.startsWith('http://') || libraryPath.startsWith('https://'))

  const addPartToLibrary = (newPart: Part): void => {
    if (libraryPath === undefined) return
    const state = props.store.getState()
    props.store.getState().libraryLoaded(
      {
        ...state.library,
        parts: { ...state.library.parts, [newPart.id.value]: newPart },
        partsByTag: newPart.tags.reduce<Readonly<Record<string, readonly PartId[]>>>(
          (acc, tag) => ({
            ...acc,
            [tag.value]: [...(acc[tag.value] ?? []), newPart.id],
          }),
          { ...state.library.partsByTag },
        ),
      },
      libraryPath,
    )
    setIsPartCreatorOpen(false)
  }

  const handleCreatePart = (result: PartCreatorResult): void => {
    if (libraryPath === undefined) return
    void generatePrimitiveGlb({
      primitiveType: result.primitiveType,
      dimensions: {
        width: result.width,
        height: result.height,
        depth: result.depth,
      },
      name: result.name,
    }).then((glbData) => {
      if (isReadOnlyLibrary) {
        const buffer = new ArrayBuffer(glbData.byteLength)
        new Uint8Array(buffer).set(glbData)
        const blobUrl = URL.createObjectURL(new Blob([buffer], { type: 'model/gltf-binary' }))
        const sanitizedId = result.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
        const tags = result.tags.map((tag) => slotTag(tag))
        const newPart: Part = {
          id: partId(sanitizedId),
          name: result.name,
          tags,
          meshFile: blobUrl,
          defaultOffset: IDENTITY_TRANSFORM,
          textureSlots: [],
          thumbnailFile: undefined,
        }
        addPartToLibrary(newPart)
      } else {
        void importPart(
          {
            name: result.name,
            tags: [...result.tags],
            defaultOffset: IDENTITY_TRANSFORM,
            fileName: `${result.name}.glb`,
            data: glbData,
          },
          libraryPath,
          props.adapter,
        ).then(addPartToLibrary)
      }
    })
  }

  const handleNewTemplate = (): void => {
    const input = Object.assign(document.createElement('input'), {
      type: 'file',
      accept: '.glb,.gltf',
    })
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (file === undefined) return
      void file.arrayBuffer().then((buffer) => {
        return inspectGlb(new Uint8Array(buffer))
      }).then((glbInfo) => {
        setTemplateWizardMeshes(glbInfo.meshes)
        setIsTemplateWizardOpen(true)
      })
    })
    input.click()
  }

  const handleTemplateSave = (
    templateName: string,
    description: string,
    slots: readonly SlotConfig[],
  ): void => {
    if (libraryPath === undefined) return
    const sanitizedId = templateName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
    const template: import('../schema/template').Template = {
      id: templateId(sanitizedId),
      name: templateName,
      description,
      version: 1,
      slots: slots.map((slot) => ({
        tag: slotTag(slot.slotTag),
        name: slot.slotName,
        anchor: {
          position: slot.anchorPosition,
          rotation: [0, 0, 0] as const,
          scale: 1,
        },
        defaultPartId: undefined,
        pairedSlot: undefined,
        required: false,
      })),
    }

    const isReadOnly = libraryPath.startsWith('http://') || libraryPath.startsWith('https://')

    if (isReadOnly) {
      const state = props.store.getState()
      props.store.getState().libraryLoaded(
        {
          ...state.library,
          templates: { ...state.library.templates, [template.id.value]: template },
        },
        libraryPath,
      )
    } else {
      void saveTemplate(template, libraryPath, props.adapter).then(() => {
        const state = props.store.getState()
        props.store.getState().libraryLoaded(
          {
            ...state.library,
            templates: { ...state.library.templates, [template.id.value]: template },
          },
          libraryPath,
        )
      })
    }

    setIsTemplateWizardOpen(false)
    setTemplateWizardMeshes([])
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
        onCreatePart={() => { setIsPartCreatorOpen(true) }}
        onNewTemplate={handleNewTemplate}
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
      <PartCreatorModal
        isOpen={isPartCreatorOpen}
        onSave={handleCreatePart}
        onClose={() => { setIsPartCreatorOpen(false) }}
      />
      <NewTemplateWizard
        isOpen={isTemplateWizardOpen}
        meshes={templateWizardMeshes}
        onSave={handleTemplateSave}
        onClose={() => {
          setIsTemplateWizardOpen(false)
          setTemplateWizardMeshes([])
        }}
      />
    </>
  )
}
