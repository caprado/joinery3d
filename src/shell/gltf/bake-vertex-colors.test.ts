import { describe, it, expect } from 'vitest'
import {
  Group,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  BufferAttribute,
} from 'three'
import { bakeVertexColors } from './bake-vertex-colors'

describe('bakeVertexColors', () => {
  it('adds a color attribute to mesh geometry', () => {
    const geometry = new BoxGeometry()
    const mesh = new Mesh(geometry, new MeshBasicMaterial())
    const group = new Group()
    group.add(mesh)

    bakeVertexColors({
      object: group,
      fallbackColor: { red: 128, green: 64, blue: 32 },
    })

    const colorAttribute = geometry.getAttribute('color')
    expect(colorAttribute).toBeDefined()
    expect(colorAttribute).toBeInstanceOf(BufferAttribute)
  })

  it('sets vertex colors to the fallback when no texture', () => {
    const geometry = new BoxGeometry()
    const mesh = new Mesh(geometry, new MeshBasicMaterial())
    const group = new Group()
    group.add(mesh)

    bakeVertexColors({
      object: group,
      fallbackColor: { red: 255, green: 0, blue: 0 },
    })

    const colorAttribute = geometry.getAttribute('color')
    if (colorAttribute instanceof BufferAttribute) {
      expect(colorAttribute.getX(0)).toBeCloseTo(1.0)
      expect(colorAttribute.getY(0)).toBeCloseTo(0.0)
      expect(colorAttribute.getZ(0)).toBeCloseTo(0.0)
    }
  })

  it('replaces material with vertex-colored MeshBasicMaterial', () => {
    const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
    const group = new Group()
    group.add(mesh)

    bakeVertexColors({
      object: group,
      fallbackColor: { red: 0, green: 255, blue: 0 },
    })

    expect(mesh.material).toBeInstanceOf(MeshBasicMaterial)
    if (mesh.material instanceof MeshBasicMaterial) {
      expect(mesh.material.vertexColors).toBe(true)
    }
  })

  it('handles empty groups without error', () => {
    const group = new Group()
    expect(() => {
      bakeVertexColors({
        object: group,
        fallbackColor: { red: 0, green: 0, blue: 0 },
      })
    }).not.toThrow()
  })
})
