import { describe, it, expect, vi } from 'vitest'
import type { UvEdge } from '../gltf/extract-uvs'
import { drawUvOverlay } from './draw-uv-overlay'

const createMockContext = (): {
  context: CanvasRenderingContext2D
  strokeCalls: number
  beginPathCalls: number
  saveCalls: number
  restoreCalls: number
} => {
  const strokeFn = vi.fn()
  const beginPathFn = vi.fn()
  const saveFn = vi.fn()
  const restoreFn = vi.fn()

  const context = {
    save: saveFn,
    restore: restoreFn,
    beginPath: beginPathFn,
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: strokeFn,
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
  }

  return {
    context: context as unknown as CanvasRenderingContext2D,
    get strokeCalls() { return strokeFn.mock.calls.length },
    get beginPathCalls() { return beginPathFn.mock.calls.length },
    get saveCalls() { return saveFn.mock.calls.length },
    get restoreCalls() { return restoreFn.mock.calls.length },
  }
}

describe('drawUvOverlay', () => {
  it('draws one stroke per edge', () => {
    const mock = createMockContext()

    const edges: readonly UvEdge[] = [
      { fromU: 0, fromV: 0, toU: 1, toV: 0 },
      { fromU: 1, fromV: 0, toU: 0.5, toV: 1 },
      { fromU: 0.5, fromV: 1, toU: 0, toV: 0 },
    ]

    drawUvOverlay({
      context: mock.context,
      edges,
      canvasWidth: 64,
      canvasHeight: 64,
      strokeColor: '#00ffff',
      lineWidth: 1,
    })

    expect(mock.strokeCalls).toBe(3)
    expect(mock.beginPathCalls).toBe(3)
  })

  it('does nothing for empty edges', () => {
    const mock = createMockContext()

    drawUvOverlay({
      context: mock.context,
      edges: [],
      canvasWidth: 64,
      canvasHeight: 64,
      strokeColor: '#00ffff',
      lineWidth: 1,
    })

    expect(mock.strokeCalls).toBe(0)
  })

  it('saves and restores context state', () => {
    const mock = createMockContext()

    drawUvOverlay({
      context: mock.context,
      edges: [{ fromU: 0, fromV: 0, toU: 1, toV: 1 }],
      canvasWidth: 64,
      canvasHeight: 64,
      strokeColor: '#ff0000',
      lineWidth: 2,
    })

    expect(mock.saveCalls).toBe(1)
    expect(mock.restoreCalls).toBe(1)
  })
})
