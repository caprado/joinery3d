/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { PerspectiveCamera } from 'three'
import { createCamera } from './camera'
import type { RendererLike } from './camera'

const createMockContainer = (): HTMLElement => {
  const el = document.createElement('div')
  Object.defineProperty(el, 'clientWidth', { value: 800 })
  Object.defineProperty(el, 'clientHeight', { value: 600 })
  return el
}

const createMockRenderer = (): RendererLike => ({
  domElement: document.createElement('canvas'),
  setSize: () => undefined,
})

describe('createCamera', () => {
  it('creates a perspective camera with correct aspect ratio', () => {
    const container = createMockContainer()
    const renderer = createMockRenderer()
    const { camera, dispose } = createCamera(container, renderer)

    expect(camera).toBeInstanceOf(PerspectiveCamera)
    expect(camera.aspect).toBeCloseTo(800 / 600)
    expect(camera.fov).toBe(50)

    dispose()
  })

  it('creates orbit controls with damping', () => {
    const container = createMockContainer()
    const renderer = createMockRenderer()
    const { controls, dispose } = createCamera(container, renderer)

    expect(controls).toBeDefined()
    expect(controls.enableDamping).toBe(true)
    expect(controls.dampingFactor).toBeCloseTo(0.1)

    dispose()
  })

  it('positions camera at (3,3,3) looking toward center', () => {
    const container = createMockContainer()
    const renderer = createMockRenderer()
    const { camera, controls, dispose } = createCamera(container, renderer)

    expect(camera.position.x).toBeCloseTo(3)
    expect(camera.position.y).toBeCloseTo(3)
    expect(camera.position.z).toBeCloseTo(3)
    expect(controls.target.y).toBeCloseTo(1)

    dispose()
  })
})
