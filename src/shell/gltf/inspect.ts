import { loadGlb } from './load'

export type MeshInfo = {
  readonly name: string
  readonly position: readonly [number, number, number]
}

export type GlbInfo = {
  readonly meshes: readonly MeshInfo[]
  readonly boundingBox: {
    readonly min: readonly [number, number, number]
    readonly max: readonly [number, number, number]
  }
}

export const inspectGlb = async (data: Uint8Array): Promise<GlbInfo> => {
  const loaded = await loadGlb(data)
  const meshes: MeshInfo[] = []

  loaded.scene.traverse((child) => {
    if ('isMesh' in child && child.isMesh) {
      meshes.push({
        name: child.name || `mesh_${String(meshes.length)}`,
        position: [child.position.x, child.position.y, child.position.z],
      })
    }
  })

  return {
    meshes,
    boundingBox: loaded.boundingBox,
  }
}
