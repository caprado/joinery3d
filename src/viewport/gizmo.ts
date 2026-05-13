import { Object3D, PerspectiveCamera } from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import type { RendererLike } from './camera'
import type { ToolMode } from '../store/state'

export type GizmoTransform = {
  readonly position: readonly [number, number, number]
  readonly rotation: readonly [number, number, number]
  readonly scale: readonly [number, number, number]
}

export type GizmoController = {
  readonly attach: (target: Object3D) => void
  readonly detach: () => void
  readonly setMode: (mode: ToolMode) => void
  readonly getControls: () => TransformControls
  readonly dispose: () => void
}

export type GizmoCallbacks = {
  readonly onTransformChange: (transform: GizmoTransform) => void
  readonly onTransformEnd: (transform: GizmoTransform) => void
}

const readTransform = (target: Object3D): GizmoTransform => ({
  position: [target.position.x, target.position.y, target.position.z],
  rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
  scale: [target.scale.x, target.scale.y, target.scale.z],
})

export const createGizmo = (
  camera: PerspectiveCamera,
  renderer: RendererLike,
  callbacks: GizmoCallbacks,
): GizmoController => {
  const controls = new TransformControls(camera, renderer.domElement)

  let isAttached = false

  const handleChange = (): void => {
    if (!isAttached) return
    callbacks.onTransformChange(readTransform(controls.object))
  }

  const handleMouseUp = (): void => {
    if (!isAttached) return
    callbacks.onTransformEnd(readTransform(controls.object))
  }

  controls.addEventListener('change', handleChange)
  controls.addEventListener('mouseUp', handleMouseUp)

  const attach = (target: Object3D): void => {
    controls.attach(target)
    isAttached = true
  }

  const detach = (): void => {
    isAttached = false
    controls.detach()
  }

  const setMode = (mode: ToolMode): void => {
    controls.setMode(mode)
  }

  const getControls = (): TransformControls => controls

  const dispose = (): void => {
    controls.removeEventListener('change', handleChange)
    controls.removeEventListener('mouseUp', handleMouseUp)
    controls.detach()
    controls.dispose()
  }

  return { attach, detach, setMode, getControls, dispose }
}
