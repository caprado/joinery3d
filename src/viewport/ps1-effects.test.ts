import { describe, it, expect } from 'vitest'
import {
  Group,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  ShaderMaterial,
} from 'three'
import {
  createPs1Material,
  applyPs1MaterialToObject,
  captureOriginalMaterials,
  removePs1MaterialFromObject,
  DEFAULT_PS1_CONFIG,
} from './ps1-effects'

describe('createPs1Material', () => {
  it('returns a ShaderMaterial', () => {
    const material = createPs1Material({
      texture: undefined,
      screenResolution: [320, 240],
    })
    expect(material).toBeInstanceOf(ShaderMaterial)
  })

  it('includes screenResolution uniform', () => {
    const material = createPs1Material({
      texture: undefined,
      screenResolution: [512, 384],
    })
    const uniform: unknown = material.uniforms['screenResolution']
    expect(uniform).toBeDefined()
    expect(typeof uniform === 'object' && uniform !== null && 'value' in uniform).toBe(true)
    if (typeof uniform === 'object' && uniform !== null && 'value' in uniform) {
      expect(uniform.value).toStrictEqual([512, 384])
    }
  })
})

describe('applyPs1MaterialToObject', () => {
  it('replaces mesh materials with PS1 shader material', () => {
    const group = new Group()
    const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial())
    group.add(mesh)

    applyPs1MaterialToObject(group, {
      ...DEFAULT_PS1_CONFIG,
      isEnabled: true,
    })

    expect(mesh.material).toBeInstanceOf(ShaderMaterial)
  })

  it('does not crash on empty groups', () => {
    const group = new Group()
    expect(() => {
      applyPs1MaterialToObject(group, DEFAULT_PS1_CONFIG)
    }).not.toThrow()
  })
})

describe('captureOriginalMaterials / removePs1MaterialFromObject', () => {
  it('captures and restores original materials', () => {
    const group = new Group()
    const originalMaterial = new MeshStandardMaterial({ color: 0xff0000 })
    const mesh = new Mesh(new BoxGeometry(), originalMaterial)
    group.add(mesh)

    const captured = captureOriginalMaterials(group)

    applyPs1MaterialToObject(group, {
      ...DEFAULT_PS1_CONFIG,
      isEnabled: true,
    })
    expect(mesh.material).toBeInstanceOf(ShaderMaterial)

    removePs1MaterialFromObject(group, captured)
    expect(mesh.material).toBe(originalMaterial)
  })
})

describe('DEFAULT_PS1_CONFIG', () => {
  it('has 320x240 resolution', () => {
    expect(DEFAULT_PS1_CONFIG.screenResolution).toStrictEqual([320, 240])
  })

  it('is disabled by default', () => {
    expect(DEFAULT_PS1_CONFIG.isEnabled).toBe(false)
  })
})
