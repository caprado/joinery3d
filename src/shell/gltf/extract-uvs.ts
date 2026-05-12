import { loadGlb } from './load'
import { Mesh, BufferAttribute, BufferGeometry, type Material } from 'three'

export type UvEdge = {
  readonly fromU: number
  readonly fromV: number
  readonly toU: number
  readonly toV: number
}

type ConcreteMesh = Mesh<BufferGeometry, Material>

const isMesh = (child: { readonly type: string }): child is ConcreteMesh =>
  child instanceof Mesh

const extractEdgesFromGeometry = (geometry: BufferGeometry): readonly UvEdge[] => {
  const uvAttribute = geometry.getAttribute('uv')
  if (!(uvAttribute instanceof BufferAttribute)) return []

  const indexAttribute = geometry.getIndex()
  if (indexAttribute === null) return []

  const indices = indexAttribute.array
  const edges: UvEdge[] = []

  for (let triangleStart = 0; triangleStart < indices.length; triangleStart += 3) {
    const indexA = indices[triangleStart]
    const indexB = indices[triangleStart + 1]
    const indexC = indices[triangleStart + 2]

    if (indexA === undefined || indexB === undefined || indexC === undefined) continue

    const uvAx = uvAttribute.getX(indexA)
    const uvAy = uvAttribute.getY(indexA)
    const uvBx = uvAttribute.getX(indexB)
    const uvBy = uvAttribute.getY(indexB)
    const uvCx = uvAttribute.getX(indexC)
    const uvCy = uvAttribute.getY(indexC)

    edges.push({ fromU: uvAx, fromV: uvAy, toU: uvBx, toV: uvBy })
    edges.push({ fromU: uvBx, fromV: uvBy, toU: uvCx, toV: uvCy })
    edges.push({ fromU: uvCx, fromV: uvCy, toU: uvAx, toV: uvAy })
  }

  return edges
}

export const extractUvEdges = async (glbData: Uint8Array): Promise<readonly UvEdge[]> => {
  const loaded = await loadGlb(glbData)
  const allEdges: UvEdge[] = []

  loaded.scene.traverse((child) => {
    if (!isMesh(child)) return
    const meshEdges = extractEdgesFromGeometry(child.geometry)
    allEdges.push(...meshEdges)
  })

  return allEdges
}
