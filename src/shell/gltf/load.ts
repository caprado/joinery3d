import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Box3, Group } from 'three'

export type LoadedGlb = {
  readonly scene: Group
  readonly boundingBox: {
    readonly min: readonly [number, number, number]
    readonly max: readonly [number, number, number]
  }
  readonly meshCount: number
}

export const loadGlb = (data: Uint8Array): Promise<LoadedGlb> =>
  new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    const buffer = new ArrayBuffer(data.byteLength)
    
    new Uint8Array(buffer).set(data)

    loader.parse(
      buffer,
      '',
      (gltf) => {
        const scene = gltf.scene
        const box = new Box3().setFromObject(scene)

        let meshCount = 0
        scene.traverse((child) => {
          if ('isMesh' in child && child.isMesh) {
            meshCount += 1
          }
        })

        resolve({
          scene,
          boundingBox: {
            min: [box.min.x, box.min.y, box.min.z],
            max: [box.max.x, box.max.y, box.max.z],
          },
          meshCount,
        })
      },
      (error: unknown) => {
        const message = error instanceof Error ? error.message : 'unknown error'
        reject(new Error(`Failed to load GLB: ${message}`))
      },
    )
  })
