import { CanvasTexture, Mesh, MeshStandardMaterial } from 'three'
import type { Object3D } from 'three'

export const updateMeshTextureFromCanvas = (
  meshGroup: Object3D,
  canvas: HTMLCanvasElement,
): void => {
  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true

  meshGroup.traverse((child) => {
    if (child instanceof Mesh) {
      const material = new MeshStandardMaterial({ map: texture })
      child.material = material
    }
  })
}
