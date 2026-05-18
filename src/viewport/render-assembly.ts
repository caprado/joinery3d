import {
  BufferGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  SRGBColorSpace,
  TextureLoader,
} from 'three'
import type { Texture } from 'three'
import type { RenderDescription, RenderNode } from '../core/assembly'
import type { TextureChannel } from '../schema/part'
import { loadGlb } from '../shell/gltf/load'
import type { FsAdapter } from '../shell/fs/adapter'

type ManagedNode = {
  readonly slotTag: string
  readonly group: Group
}

export type AssemblyRenderer = {
  readonly apply: (
    description: RenderDescription,
    libraryPath: string,
    adapter: FsAdapter,
  ) => Promise<void>
  readonly clear: () => void
  readonly getSlotObject: (slotTag: string) => Object3D | undefined
}

const resolveTexturePath = (filePath: string, libraryPath: string): string => {
  const isAbsoluteUrl = filePath.startsWith('blob:')
    || filePath.startsWith('http:')
    || filePath.startsWith('https:')
  return isAbsoluteUrl ? filePath : `${libraryPath}/${filePath}`
}

const loadTextureFromUrl = (textureUrl: string): Promise<Texture> =>
  new Promise((resolve, reject) => {
    const loader = new TextureLoader()
    loader.load(
      textureUrl,
      (texture) => {
        texture.colorSpace = SRGBColorSpace
        resolve(texture)
      },
      undefined,
      (error) => {
        reject(error instanceof Error ? error : new Error('Failed to load texture'))
      },
    )
  })

const loadTextureFromData = (data: Uint8Array): Promise<Texture> => {
  const buffer = new ArrayBuffer(data.byteLength)
  new Uint8Array(buffer).set(data)
  const blob = new Blob([buffer], { type: 'image/png' })
  const objectUrl = URL.createObjectURL(blob)
  return loadTextureFromUrl(objectUrl).then((texture) => {
    URL.revokeObjectURL(objectUrl)
    return texture
  }).catch((error: unknown) => {
    URL.revokeObjectURL(objectUrl)
    throw error
  })
}

type LoadedTextures = Readonly<Partial<Record<TextureChannel, Texture>>>

const isDirectlyLoadableUrl = (path: string): boolean =>
  path.startsWith('blob:') || path.startsWith('data:')

const loadTexturesForNode = async (
  renderNode: RenderNode,
  libraryPath: string,
  adapter: FsAdapter,
): Promise<LoadedTextures> => {
  const entries = Object.entries(renderNode.textures) as ReadonlyArray<readonly [TextureChannel, string]>
  if (entries.length === 0) return {}

  const results = await Promise.all(
    entries.map(async ([channel, filePath]) => {
      try {
        const fullPath = resolveTexturePath(filePath, libraryPath)
        const texture = isDirectlyLoadableUrl(fullPath)
          ? await loadTextureFromUrl(fullPath)
          : await loadTextureFromData(await adapter.readBinaryFile(fullPath))
        return [channel, texture] as const
      } catch (loadError: unknown) {
        const message = loadError instanceof Error ? loadError.message : 'unknown'
        console.warn(`[Viewport] Failed to load texture ${channel} from ${filePath}: ${message}`)
        return undefined
      }
    }),
  )

  return Object.fromEntries(
    results.filter((entry): entry is readonly [TextureChannel, Texture] => entry !== undefined),
  )
}

const applyTexturesToMaterial = (
  material: MeshStandardMaterial,
  textures: LoadedTextures,
): void => {
  if (textures.diffuse !== undefined) {
    material.map = textures.diffuse
    material.needsUpdate = true
  }
  if (textures.normal !== undefined) {
    material.normalMap = textures.normal
    material.needsUpdate = true
  }
  if (textures.specular !== undefined) {
    material.roughnessMap = textures.specular
    material.needsUpdate = true
  }
  if (textures.emissive !== undefined) {
    material.emissiveMap = textures.emissive
    material.emissive.setHex(0xffffff)
    material.needsUpdate = true
  }
}

export const createAssemblyRenderer = (scene: Scene): AssemblyRenderer => {
  const assemblyRoot = new Group()
  assemblyRoot.name = 'assembly-root'
  scene.add(assemblyRoot)

  let currentNodes: ManagedNode[] = []

  const clear = (): void => {
    for (const node of currentNodes) {
      assemblyRoot.remove(node.group)
    }
    currentNodes = []
  }

  const applyNode = async (
    renderNode: RenderNode,
    libraryPath: string,
    adapter: FsAdapter,
  ): Promise<ManagedNode> => {
    const isAbsoluteUrl = renderNode.meshFile.startsWith('blob:')
      || renderNode.meshFile.startsWith('http:')
      || renderNode.meshFile.startsWith('https:')
    const meshPath = isAbsoluteUrl
      ? renderNode.meshFile
      : `${libraryPath}/${renderNode.meshFile}`
    const meshData = await adapter.readBinaryFile(meshPath)
    const loaded = await loadGlb(meshData)

    const group = loaded.scene
    group.name = renderNode.slotTag.value
    group.userData = { slotTag: renderNode.slotTag.value }

    const loadedTextures = await loadTexturesForNode(renderNode, libraryPath, adapter)

    group.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.geometry instanceof BufferGeometry && child.geometry.getAttribute('normal') === undefined) {
          child.geometry.computeVertexNormals()
        }
        if (child.material instanceof MeshStandardMaterial) {
          child.material.side = DoubleSide
          applyTexturesToMaterial(child.material, loadedTextures)
        }
      }
    })

    group.position.set(
      renderNode.worldTransform.position[0],
      renderNode.worldTransform.position[1],
      renderNode.worldTransform.position[2],
    )
    group.rotation.set(
      renderNode.worldTransform.rotation[0],
      renderNode.worldTransform.rotation[1],
      renderNode.worldTransform.rotation[2],
    )

    const scale = typeof renderNode.worldTransform.scale === 'number'
      ? [renderNode.worldTransform.scale, renderNode.worldTransform.scale, renderNode.worldTransform.scale]
      : renderNode.worldTransform.scale
    group.scale.set(scale[0], scale[1], scale[2])

    return { slotTag: renderNode.slotTag.value, group }
  }

  const apply = async (
    description: RenderDescription,
    libraryPath: string,
    adapter: FsAdapter,
  ): Promise<void> => {
    clear()

    const nodes = await Promise.all(
      description.nodes.map((node) => applyNode(node, libraryPath, adapter)),
    )

    for (const node of nodes) {
      assemblyRoot.add(node.group)
    }
    currentNodes = nodes
  }

  const getSlotObject = (slotTag: string): Object3D | undefined =>
    currentNodes.find((node) => node.slotTag === slotTag)?.group

  return { apply, clear, getSlotObject }
}
