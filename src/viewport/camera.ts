import { PerspectiveCamera } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type RendererLike = {
  readonly domElement: HTMLElement
  readonly setSize: (width: number, height: number) => void
}

export type CameraSetup = {
  readonly camera: PerspectiveCamera
  readonly controls: OrbitControls
  readonly dispose: () => void
}

export const createCamera = (
  container: HTMLElement,
  renderer: RendererLike,
): CameraSetup => {
  const width = container.clientWidth
  const height = container.clientHeight
  const aspect = height > 0 ? width / height : 1

  const camera = new PerspectiveCamera(50, aspect, 0.1, 1000)
  camera.position.set(3, 3, 3)
  camera.lookAt(0, 1, 0)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.update()

  const handleResize = (): void => {
    const newWidth = container.clientWidth
    const newHeight = container.clientHeight
    const newAspect = newHeight > 0 ? newWidth / newHeight : 1
    camera.aspect = newAspect
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
  }

  const resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(container)

  const dispose = (): void => {
    resizeObserver.disconnect()
    controls.dispose()
  }

  return { camera, controls, dispose }
}
