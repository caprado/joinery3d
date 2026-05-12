/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from 'preact'
import { Group } from 'three'
import { useLivePreview } from './use-live-preview'

const TestComponent = (props: {
  canvasRef: { current: HTMLCanvasElement | null }
  meshGroup: Group | undefined
  isActive: boolean
}) => {
  useLivePreview({
    canvasRef: props.canvasRef,
    meshGroup: props.meshGroup,
    isActive: props.isActive,
    updateIntervalMs: 100,
  })
  return null
}

describe('useLivePreview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not throw when active with a mesh group and canvas', () => {
    const canvas = document.createElement('canvas')
    const canvasRef = { current: canvas }
    const meshGroup = new Group()
    const container = document.createElement('div')

    expect(() => {
      render(
        <TestComponent
          canvasRef={canvasRef}
          meshGroup={meshGroup}
          isActive={true}
        />,
        container,
      )
      vi.advanceTimersByTime(200)
    }).not.toThrow()
  })

  it('does not throw when inactive', () => {
    const canvas = document.createElement('canvas')
    const canvasRef = { current: canvas }
    const container = document.createElement('div')

    expect(() => {
      render(
        <TestComponent
          canvasRef={canvasRef}
          meshGroup={new Group()}
          isActive={false}
        />,
        container,
      )
      vi.advanceTimersByTime(200)
    }).not.toThrow()
  })

  it('does not throw when mesh group is undefined', () => {
    const canvas = document.createElement('canvas')
    const canvasRef = { current: canvas }
    const container = document.createElement('div')

    expect(() => {
      render(
        <TestComponent
          canvasRef={canvasRef}
          meshGroup={undefined}
          isActive={true}
        />,
        container,
      )
      vi.advanceTimersByTime(200)
    }).not.toThrow()
  })
})
