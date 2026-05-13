import {
  Mesh,
  BufferAttribute,
  BufferGeometry,
  Color,
  Texture,
  MeshBasicMaterial,
  type Object3D,
  type Material,
} from 'three'

export type BakeVertexColorsArgs = {
  readonly object: Object3D
  readonly fallbackColor: { readonly red: number; readonly green: number; readonly blue: number }
}

type ConcreteMesh = Mesh<BufferGeometry, Material>

const isMesh = (child: Object3D): child is ConcreteMesh =>
  child instanceof Mesh

export const bakeVertexColors = (args: BakeVertexColorsArgs): void => {
  args.object.traverse((child) => {
    if (!isMesh(child)) return
    const geometry: BufferGeometry = child.geometry

    const positionAttribute = geometry.getAttribute('position')
    if (!(positionAttribute instanceof BufferAttribute)) return

    const vertexCount = positionAttribute.count
    const colors = new Float32Array(vertexCount * 3)

    const texture = getTextureFromMesh(child.material)
    const uvAttribute = geometry.getAttribute('uv')
    const hasUvs = uvAttribute instanceof BufferAttribute

    if (texture !== undefined && hasUvs) {
      const canvas = textureToCanvas(texture)
      if (canvas !== undefined) {
        const context = canvas.getContext('2d')
        if (context !== null) {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
            const uvX = uvAttribute.getX(vertexIndex)
            const uvY = uvAttribute.getY(vertexIndex)
            const pixelColor = sampleImageData(imageData, uvX, uvY)
            colors[vertexIndex * 3] = pixelColor.r
            colors[vertexIndex * 3 + 1] = pixelColor.g
            colors[vertexIndex * 3 + 2] = pixelColor.b
          }
        }
      }
    } else {
      const fallback = new Color(
        args.fallbackColor.red / 255,
        args.fallbackColor.green / 255,
        args.fallbackColor.blue / 255,
      )
      for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
        colors[vertexIndex * 3] = fallback.r
        colors[vertexIndex * 3 + 1] = fallback.g
        colors[vertexIndex * 3 + 2] = fallback.b
      }
    }

    geometry.setAttribute('color', new BufferAttribute(colors, 3))
    child.material = new MeshBasicMaterial({ vertexColors: true })
  })
}

const getTextureFromMesh = (material: Material | Material[]): Texture | undefined => {
  const first = Array.isArray(material) ? material[0] : material
  if (first === undefined) return undefined
  if (!('map' in first)) return undefined
  const mapValue: unknown = first.map
  if (mapValue instanceof Texture) return mapValue
  return undefined
}

const textureToCanvas = (texture: Texture): HTMLCanvasElement | undefined => {
  const image = texture.image
  if (!(image instanceof HTMLImageElement || image instanceof HTMLCanvasElement)) return undefined

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (context === null) return undefined
  context.drawImage(image, 0, 0)
  return canvas
}

const sampleImageData = (
  imageData: ImageData,
  uvX: number,
  uvY: number,
): { readonly r: number; readonly g: number; readonly b: number } => {
  const pixelX = Math.floor(uvX * (imageData.width - 1))
  const pixelY = Math.floor((1 - uvY) * (imageData.height - 1))
  const clampedX = Math.max(0, Math.min(pixelX, imageData.width - 1))
  const clampedY = Math.max(0, Math.min(pixelY, imageData.height - 1))
  const index = (clampedY * imageData.width + clampedX) * 4

  return {
    r: (imageData.data[index] ?? 0) / 255,
    g: (imageData.data[index + 1] ?? 0) / 255,
    b: (imageData.data[index + 2] ?? 0) / 255,
  }
}
