import {
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  ConeGeometry,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

export type PrimitiveType = 'box' | 'cylinder' | 'sphere' | 'cone'

export type PrimitiveDimensions = {
  readonly width: number
  readonly height: number
  readonly depth: number
}

export type GeneratePrimitiveArgs = {
  readonly primitiveType: PrimitiveType
  readonly dimensions: PrimitiveDimensions
  readonly name: string
}

export const generatePrimitiveGlb = (args: GeneratePrimitiveArgs): Promise<Uint8Array> => {
  const geometry = createGeometry(args.primitiveType, args.dimensions)
  geometry.computeVertexNormals()

  const material = new MeshStandardMaterial({ color: 0xcccccc })
  const mesh = new Mesh(geometry, material)
  mesh.name = args.name

  const scene = new Scene()
  scene.add(mesh)

  return exportToGlb(scene)
}

const createGeometry = (
  primitiveType: PrimitiveType,
  dimensions: PrimitiveDimensions,
): BoxGeometry | CylinderGeometry | SphereGeometry | ConeGeometry => {
  switch (primitiveType) {
    case 'box':
      return new BoxGeometry(dimensions.width, dimensions.height, dimensions.depth)
    case 'cylinder':
      return new CylinderGeometry(
        dimensions.width / 2,
        dimensions.width / 2,
        dimensions.height,
        16,
      )
    case 'sphere':
      return new SphereGeometry(dimensions.width / 2, 16, 12)
    case 'cone':
      return new ConeGeometry(dimensions.width / 2, dimensions.height, 16)
  }
}

const exportToGlb = (scene: Scene): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const exporter = new GLTFExporter()
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(new Uint8Array(result))
        } else {
          reject(new Error('GLTFExporter returned JSON instead of binary'))
        }
      },
      (error: unknown) => {
        const message = error instanceof Error ? error.message : 'unknown error'
        reject(new Error(`Primitive export failed: ${message}`))
      },
      { binary: true },
    )
  })
