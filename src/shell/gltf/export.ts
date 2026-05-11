import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { Group, Mesh, MeshStandardMaterial, Object3D, TextureLoader } from 'three'
import type { RenderDescription } from '../../core/assembly'
import { loadGlb } from './load'
import type { FsAdapter } from '../fs/adapter'
import type { BufferGeometry, Material } from 'three'

export type ExportOptions = {
  readonly embedTextures: boolean
  readonly bakeHierarchyFlat: boolean
}

export const exportGlb = async (
  description: RenderDescription,
  libraryPath: string,
  adapter: FsAdapter,
  options: ExportOptions,
): Promise<Uint8Array> => {
  const root = new Group()

  for (const node of description.nodes) {
    const meshPath = `${libraryPath}/${node.meshFile}`
    const meshData = await adapter.readBinaryFile(meshPath)
    const loaded = await loadGlb(meshData)

    const nodeGroup = loaded.scene.clone()
    nodeGroup.name = node.slotTag.value

    nodeGroup.position.set(
      node.worldTransform.position[0],
      node.worldTransform.position[1],
      node.worldTransform.position[2],
    )
    nodeGroup.rotation.set(
      node.worldTransform.rotation[0],
      node.worldTransform.rotation[1],
      node.worldTransform.rotation[2],
    )

    const scale = typeof node.worldTransform.scale === 'number'
      ? [node.worldTransform.scale, node.worldTransform.scale, node.worldTransform.scale]
      : node.worldTransform.scale
    nodeGroup.scale.set(scale[0], scale[1], scale[2])

    if (options.embedTextures && node.textures['diffuse'] !== undefined) {
      const texturePath = `${libraryPath}/${node.textures['diffuse']}`
      try {
        const textureData = await adapter.readBinaryFile(texturePath)
        applyTextureToMeshes(nodeGroup, textureData)
      } catch {
        // Skip texture if it can't be loaded
      }
    }

    root.add(nodeGroup)
  }

  if (options.bakeHierarchyFlat) {
    bakeTransforms(root)
  }

  return exportSceneToGlb(root)
}

const applyTextureToMeshes = (group: Object3D, textureData: Uint8Array): void => {
  const buffer = new ArrayBuffer(textureData.byteLength)
  new Uint8Array(buffer).set(textureData)

  const blob = new Blob([buffer], { type: 'image/png' })
  const url = URL.createObjectURL(blob)
  const loader = new TextureLoader()
  const texture = loader.load(url)

  group.traverse((child) => {
    if (child instanceof Mesh) {
      const material = new MeshStandardMaterial({ map: texture })
      child.material = material
    }
  })
}

type ConcreteMesh = Mesh<BufferGeometry, Material>

const isMesh = (child: Object3D): child is ConcreteMesh =>
  child instanceof Mesh

const bakeTransforms = (root: Group): void => {
  root.traverse((child) => {
    if (isMesh(child)) {
      child.updateMatrixWorld(true)
      child.geometry.applyMatrix4(child.matrixWorld)
      child.position.set(0, 0, 0)
      child.rotation.set(0, 0, 0)
      child.scale.set(1, 1, 1)
    }
  })
}

const exportSceneToGlb = (scene: Group): Promise<Uint8Array> =>
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
        reject(new Error(`GLB export failed: ${message}`))
      },
      { binary: true },
    )
  })
