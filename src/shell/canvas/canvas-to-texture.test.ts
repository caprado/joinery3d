/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import {
  Group,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three'
import { updateMeshTextureFromCanvas } from './canvas-to-texture'

describe('updateMeshTextureFromCanvas', () => {
  it('applies a CanvasTexture to all meshes in a group', () => {
    const group = new Group()
    const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
    group.add(mesh)

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64

    updateMeshTextureFromCanvas(group, canvas)

    expect(mesh.material).toBeInstanceOf(MeshStandardMaterial)
    const material = mesh.material
    if (material instanceof MeshStandardMaterial) {
      expect(material.map).not.toBeNull()
    }
  })

  it('handles groups with no meshes without error', () => {
    const group = new Group()
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32

    expect(() => {
      updateMeshTextureFromCanvas(group, canvas)
    }).not.toThrow()
  })
})
