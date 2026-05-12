/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render } from 'preact'
import type { UvEdge } from '../../shell/gltf/extract-uvs'
import { UvOverlayCanvas } from './uv-overlay-canvas'

const testEdges: readonly UvEdge[] = [
  { fromU: 0, fromV: 0, toU: 1, toV: 0 },
  { fromU: 1, fromV: 0, toU: 0.5, toV: 1 },
]

describe('UvOverlayCanvas', () => {
  it('renders a canvas when visible', () => {
    const container = document.createElement('div')
    render(
      <UvOverlayCanvas
        width={64}
        height={64}
        edges={testEdges}
        isVisible={true}
      />,
      container,
    )
    const canvas = container.querySelector('.uv-overlay-canvas')
    expect(canvas).not.toBeNull()
  })

  it('renders nothing when not visible', () => {
    const container = document.createElement('div')
    render(
      <UvOverlayCanvas
        width={64}
        height={64}
        edges={testEdges}
        isVisible={false}
      />,
      container,
    )
    const canvas = container.querySelector('.uv-overlay-canvas')
    expect(canvas).toBeNull()
  })

  it('sets pointer-events to none so painting passes through', () => {
    const container = document.createElement('div')
    render(
      <UvOverlayCanvas
        width={64}
        height={64}
        edges={testEdges}
        isVisible={true}
      />,
      container,
    )
    const canvas = container.querySelector('.uv-overlay-canvas')
    if (canvas instanceof HTMLElement) {
      expect(canvas.style.pointerEvents).toBe('none')
    }
  })
})
