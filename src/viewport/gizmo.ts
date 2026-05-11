import { Object3D, PerspectiveCamera } from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import type { RendererLike } from './camera'
import type { ToolMode } from '../store/state'

export type GizmoController = {
  readonly attach: (target: Object3D) => void
  readonly detach: () => void
  readonly setMode: (mode: ToolMode) => void
  readonly getControls: () => TransformControls
  readonly dispose: () => void
}

export type GizmoCallbacks = {
  readonly onTransformEnd: (
    position: readonly [number, number, number], 
    rotation: readonly [number, number, number], 
    scale: readonly [number, number, number]
  ) => void
}

export const createGizmo = (
  camera: PerspectiveCamera,
  renderer: RendererLike,
  callbacks: GizmoCallbacks,
): GizmoController => {
  const controls = new TransformControls(camera, renderer.domElement)

  const handleChange = (): void => {
    const target = controls.object

    const position: readonly [number, number, number] = [
      target.position.x,
      target.position.y,
      target.position.z,
    ]
    const rotation: readonly [number, number, number] = [
      target.rotation.x,
      target.rotation.y,
      target.rotation.z,
    ]
    const scale: readonly [number, number, number] = [
      target.scale.x,
      target.scale.y,
      target.scale.z,
    ]

    callbacks.onTransformEnd(position, rotation, scale)
  }

  controls.addEventListener('mouseUp', handleChange)

  const attach = (target: Object3D): void => {
    controls.attach(target)
  }

  const detach = (): void => {
    controls.detach()
  }

  const setMode = (mode: ToolMode): void => {
    controls.setMode(mode)
  }

  const getControls = (): TransformControls => controls

  const dispose = (): void => {
    controls.removeEventListener('mouseUp', handleChange)
    controls.detach()
    controls.dispose()
  }

  return { attach, detach, setMode, getControls, dispose }
}
