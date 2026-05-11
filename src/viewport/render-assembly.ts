import { Group, Object3D, Scene } from 'three'
import type { RenderDescription, RenderNode } from '../core/assembly'
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
    const meshPath = `${libraryPath}/${renderNode.meshFile}`
    const meshData = await adapter.readBinaryFile(meshPath)
    const loaded = await loadGlb(meshData)

    const group = loaded.scene
    group.name = renderNode.slotTag.value
    group.userData = { slotTag: renderNode.slotTag.value }

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
