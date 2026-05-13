/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { Group, Mesh, BoxGeometry, MeshBasicMaterial, PerspectiveCamera } from 'three'
import { createGizmo } from './gizmo'
import type { RendererLike } from './camera'

const createMockRenderer = (): RendererLike => ({
  domElement: document.createElement('canvas'),
  setSize: () => undefined,
})

describe('createGizmo', () => {
  it('creates a gizmo that can attach to an object', () => {
    const camera = new PerspectiveCamera()
    const renderer = createMockRenderer()
    const onTransformEnd = vi.fn()
    const gizmo = createGizmo(camera, renderer, { onTransformChange: vi.fn(), onTransformEnd })

    const target = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
    gizmo.attach(target)

    expect(gizmo.getControls().object).toBe(target)

    gizmo.dispose()
  })

  it('detaches from the current target', () => {
    const camera = new PerspectiveCamera()
    const renderer = createMockRenderer()
    const onTransformEnd = vi.fn()
    const gizmo = createGizmo(camera, renderer, { onTransformChange: vi.fn(), onTransformEnd })

    const target = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
    gizmo.attach(target)
    gizmo.detach()

    expect(gizmo.getControls().object).toBeUndefined()

    gizmo.dispose()
  })

  it('sets the transform mode', () => {
    const camera = new PerspectiveCamera()
    const renderer = createMockRenderer()
    const onTransformEnd = vi.fn()
    const gizmo = createGizmo(camera, renderer, { onTransformChange: vi.fn(), onTransformEnd })

    gizmo.setMode('rotate')
    expect(gizmo.getControls().mode).toBe('rotate')

    gizmo.setMode('scale')
    expect(gizmo.getControls().mode).toBe('scale')

    gizmo.setMode('translate')
    expect(gizmo.getControls().mode).toBe('translate')

    gizmo.dispose()
  })

  it('starts in translate mode by default', () => {
    const camera = new PerspectiveCamera()
    const renderer = createMockRenderer()
    const onTransformEnd = vi.fn()
    const gizmo = createGizmo(camera, renderer, { onTransformChange: vi.fn(), onTransformEnd })

    expect(gizmo.getControls().mode).toBe('translate')

    gizmo.dispose()
  })

  it('provides access to TransformControls for scene addition', () => {
    const camera = new PerspectiveCamera()
    const renderer = createMockRenderer()
    const onTransformEnd = vi.fn()
    const gizmo = createGizmo(camera, renderer, { onTransformChange: vi.fn(), onTransformEnd })

    const controls = gizmo.getControls()
    expect(controls).toBeDefined()
    expect(controls.mode).toBe('translate')

    gizmo.dispose()
  })

  it('calls onTransformEnd when mouseUp fires with an attached object', () => {
    const camera = new PerspectiveCamera()
    const renderer = createMockRenderer()
    const onTransformEnd = vi.fn()
    const gizmo = createGizmo(camera, renderer, { onTransformChange: vi.fn(), onTransformEnd })

    const target = new Group()
    target.position.set(1, 2, 3)
    target.rotation.set(0.1, 0.2, 0.3)
    target.scale.set(2, 2, 2)
    gizmo.attach(target)

    gizmo.getControls().dispatchEvent({ type: 'mouseUp', mode: 'translate' })

    expect(onTransformEnd).toHaveBeenCalledOnce()

    gizmo.dispose()
  })
})
