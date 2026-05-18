import { WebGLRenderer, Mesh, MeshStandardMaterial } from 'three'
import type { Material } from 'three'

import type { StoreApi } from 'zustand/vanilla'
import type { Store } from '../store/store'
import type { FsAdapter } from '../shell/fs/adapter'
import { buildRenderDescription } from '../core/assembly'
import { findTemplate } from '../schema/library'
import { slotTag } from '../schema/ids'
import { createScene, setGridVisible } from './scene'
import { createCamera } from './camera'
import { createAssemblyRenderer } from './render-assembly'
import { createPicker } from './picking'
import { createGizmo } from './gizmo'
import {
  applyPs1MaterialToObject,
  removePs1MaterialFromObject,
  updatePs1Brightness,
  captureOriginalMaterials,
  DEFAULT_PS1_CONFIG,
} from './ps1-effects'
import type { BackgroundMode, Selection, ToolMode, ViewOptions } from '../store/state'
import { loadEquirectangularTexture } from '../shell/image/load-equirectangular-texture'

export type Viewport = {
  readonly mount: (container: HTMLElement) => void
  readonly unmount: () => void
  readonly resetCamera: () => void
  readonly dispose: () => void
}

export const createViewport = (
  store: StoreApi<Store>,
  adapter: FsAdapter,
): Viewport => {
  let renderer: WebGLRenderer | undefined
  let animationFrameId: number | undefined
  let unsubscribe: (() => void) | undefined

  const sceneSetup = createScene()

  const mount = (container: HTMLElement): void => {
    renderer = new WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const cameraSetup = createCamera(container, renderer)

    resetCameraFn = () => {
      cameraSetup.camera.position.set(3, 3, 3)
      cameraSetup.controls.target.set(0, 1, 0)
      cameraSetup.controls.update()
    }
    const assemblyRenderer = createAssemblyRenderer(sceneSetup.scene)
    const picker = createPicker(cameraSetup.camera, sceneSetup.scene)

    let isDraggingGizmo = false

    const computeInstanceOffset = (
      transform: import('./gizmo').GizmoTransform,
    ): import('../schema/transform').Transform | undefined => {
      const state = store.getState()
      if (state.selection.kind !== 'slot' || state.currentInstance === undefined) return undefined
      const selectedTag = state.selection.slotTag
      const currentTemplate = findTemplate(state.library, state.currentInstance.templateId)
      if (currentTemplate === undefined) return undefined

      const slotDef = currentTemplate.slots.find(
        (slot) => slot.tag.value === selectedTag.value,
      )
      if (slotDef === undefined) return undefined

      const assignment = state.currentInstance.slots[selectedTag.value]
      if (assignment === undefined) return undefined

      const part = state.library.parts[assignment.partId.value]
      const partDefaultPos = part?.defaultOffset.position ?? [0, 0, 0]
      const partDefaultRot = part?.defaultOffset.rotation ?? [0, 0, 0]

      return {
        position: [
          transform.position[0] - slotDef.anchor.position[0] - partDefaultPos[0],
          transform.position[1] - slotDef.anchor.position[1] - partDefaultPos[1],
          transform.position[2] - slotDef.anchor.position[2] - partDefaultPos[2],
        ],
        rotation: [
          transform.rotation[0] - slotDef.anchor.rotation[0] - partDefaultRot[0],
          transform.rotation[1] - slotDef.anchor.rotation[1] - partDefaultRot[1],
          transform.rotation[2] - slotDef.anchor.rotation[2] - partDefaultRot[2],
        ],
        scale: transform.scale[0] === transform.scale[1] && transform.scale[1] === transform.scale[2]
          ? transform.scale[0]
          : transform.scale,
      }
    }

    const gizmo = createGizmo(cameraSetup.camera, renderer, {
      onTransformChange: () => {
        // Live preview — the gizmo moves the object directly in the scene,
        // so the viewport already shows the update. No store write needed
        // during drag to avoid rebuild flicker.
      },
      onTransformEnd: (transform) => {
        const offset = computeInstanceOffset(transform)
        if (offset === undefined) return
        const state = store.getState()
        if (state.selection.kind !== 'slot') return
        store.getState().setSlotOffset(state.selection.slotTag, offset)
      },
    })

    sceneSetup.scene.add(gizmo.getControls().getHelper())

    gizmo.getControls().addEventListener('dragging-changed', (event) => {
      const dragging = event.value === true
      cameraSetup.controls.enabled = !dragging
      if (dragging) {
        isDraggingGizmo = true
      } else {
        setTimeout(() => { isDraggingGizmo = false }, 50)
      }
    })

    const handleClick = (event: MouseEvent): void => {
      if (isDraggingGizmo) return
      if (event.target !== renderer?.domElement) return
      const rect = container.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const result = picker.pick(x, y, rect.width, rect.height)
      if (result !== undefined) {
        store.getState().setSelection({ kind: 'slot', slotTag: slotTag(result.slotTag) })
      } else {
        store.getState().setSelection({ kind: 'none' })
      }
    }

    container.addEventListener('click', handleClick)

    let previousSelection: Selection = { kind: 'none' }
    let previousToolMode: ToolMode = 'translate'
    let previousShowGrid = true
    let previousWireframe = false
    let previousPs1 = false
    let previousBrightness = 1.0
    let previousBackground: BackgroundMode = { kind: 'solid', color: '#1a1a1a' }
    let previousInstance = store.getState().currentInstance
    let originalMaterials = new Map<string, Material | Material[]>()

    const renderScene = async (): Promise<void> => {
      gizmo.detach()

      const state = store.getState()
      if (state.currentInstance !== undefined) {
        const template = findTemplate(state.library, state.currentInstance.templateId)
        if (template !== undefined) {
          const description = buildRenderDescription(state.currentInstance, template, state.library)
          try {
            await assemblyRenderer.apply(description, state.libraryPath ?? '', adapter)
          } catch (loadError: unknown) {
            const message = loadError instanceof Error ? loadError.message : 'unknown'
            console.error(`[Viewport] Assembly load failed: ${message}`)
          }
        }

        if (state.selection.kind === 'slot') {
          const obj = assemblyRenderer.getSlotObject(state.selection.slotTag.value)
          if (obj !== undefined) {
            gizmo.attach(obj)
          }
        }
      } else {
        assemblyRenderer.clear()
      }
    }

    const handleStateChange = (): void => {
      const state = store.getState()

      if (state.viewOptions.showGrid !== previousShowGrid) {
        setGridVisible(sceneSetup, state.viewOptions.showGrid)
        previousShowGrid = state.viewOptions.showGrid
      }

      if (state.viewOptions.wireframe !== previousWireframe) {
        sceneSetup.scene.traverse((child) => {
          if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
            child.material.wireframe = state.viewOptions.wireframe
          }
        })
        previousWireframe = state.viewOptions.wireframe
      }

      if (state.viewOptions.ps1Effects !== previousPs1) {
        const assemblyRoot = sceneSetup.scene.getObjectByName('assembly-root')
        if (assemblyRoot !== undefined) {
          if (state.viewOptions.ps1Effects) {
            originalMaterials = captureOriginalMaterials(assemblyRoot)
            applyPs1MaterialToObject(assemblyRoot, {
              ...DEFAULT_PS1_CONFIG,
              isEnabled: true,
              brightness: state.viewOptions.brightness,
            })
          } else {
            removePs1MaterialFromObject(assemblyRoot, originalMaterials)
            originalMaterials = new Map()
          }
        }
        previousPs1 = state.viewOptions.ps1Effects
      }

      const viewOpts: ViewOptions = state.viewOptions
      if (viewOpts.brightness !== previousBrightness) {
        sceneSetup.setBrightness(viewOpts.brightness)
        if (viewOpts.ps1Effects) {
          const assemblyRootForBrightness = sceneSetup.scene.getObjectByName('assembly-root')
          if (assemblyRootForBrightness !== undefined) {
            updatePs1Brightness(assemblyRootForBrightness, viewOpts.brightness)
          }
        }
        previousBrightness = viewOpts.brightness
      }

      if (viewOpts.background !== previousBackground) {
        if (viewOpts.background.kind === 'solid') {
          sceneSetup.setBackgroundColor(viewOpts.background.color)
        } else if (viewOpts.background.kind === 'skybox') {
          const skyboxUrl = viewOpts.background.imageUrl
          void loadEquirectangularTexture(skyboxUrl).then((texture) => {
            sceneSetup.setSkybox(texture)
          })
        }
        previousBackground = viewOpts.background
      }

      if (state.currentInstance !== previousInstance) {
        previousInstance = state.currentInstance
        void renderScene()
      }

      if (state.selection !== previousSelection) {
        if (state.selection.kind === 'slot') {
          const obj = assemblyRenderer.getSlotObject(state.selection.slotTag.value)
          if (obj !== undefined) {
            gizmo.attach(obj)
          }
        } else {
          gizmo.detach()
        }
        previousSelection = state.selection
      }

      if (state.toolMode !== previousToolMode) {
        gizmo.setMode(state.toolMode)
        previousToolMode = state.toolMode
      }
    }

    unsubscribe = store.subscribe(handleStateChange)

    void renderScene()

    const animate = (): void => {
      animationFrameId = requestAnimationFrame(animate)
      cameraSetup.controls.update()
      if (renderer !== undefined) {
        renderer.render(sceneSetup.scene, cameraSetup.camera)
      }
    }
    animate()

    const currentUnmount = (): void => {
      container.removeEventListener('click', handleClick)
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId)
      }
      unsubscribe?.()
      gizmo.dispose()
      cameraSetup.dispose()
      assemblyRenderer.clear()
      renderer?.dispose()
      if (renderer?.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
      renderer = undefined
    }

    unmountFn = currentUnmount
  }

  let unmountFn: (() => void) | undefined
  let resetCameraFn: (() => void) | undefined

  const unmount = (): void => {
    unmountFn?.()
    unmountFn = undefined
    resetCameraFn = undefined
  }

  const dispose = (): void => {
    unmount()
  }

  const resetCamera = (): void => {
    resetCameraFn?.()
  }

  return { mount, unmount, dispose, resetCamera }
}
