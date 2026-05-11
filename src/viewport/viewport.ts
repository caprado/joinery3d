import { WebGLRenderer } from 'three'
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
import type { Selection, ToolMode } from '../store/state'

export type Viewport = {
  readonly mount: (container: HTMLElement) => void
  readonly unmount: () => void
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
    const assemblyRenderer = createAssemblyRenderer(sceneSetup.scene)
    const picker = createPicker(cameraSetup.camera, sceneSetup.scene)

    const gizmo = createGizmo(cameraSetup.camera, renderer, {
      onTransformEnd: (position, rotation, scale) => {
        const state = store.getState()
        if (state.selection.kind !== 'slot') return
        store.getState().setSlotOffset(state.selection.slotTag, {
          position,
          rotation,
          scale: scale[0] === scale[1] && scale[1] === scale[2] ? scale[0] : scale,
        })
      },
    })

    sceneSetup.scene.add(gizmo.getControls().getHelper())

    const handleClick = (event: MouseEvent): void => {
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

    const handleStateChange = (): void => {
      const state = store.getState()

      if (state.viewOptions.showGrid !== previousShowGrid) {
        setGridVisible(sceneSetup, state.viewOptions.showGrid)
        previousShowGrid = state.viewOptions.showGrid
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

    const renderScene = async (): Promise<void> => {
      const state = store.getState()
      if (state.currentInstance !== undefined) {
        const template = findTemplate(state.library, state.currentInstance.templateId)
        if (template !== undefined) {
          const description = buildRenderDescription(state.currentInstance, template, state.library)
          await assemblyRenderer.apply(description, state.libraryPath ?? '', adapter)
        }
      }
    }

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

  const unmount = (): void => {
    unmountFn?.()
    unmountFn = undefined
  }

  const dispose = (): void => {
    unmount()
  }

  return { mount, unmount, dispose }
}
