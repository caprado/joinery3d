import type { JSX } from 'preact'
import { useRef, useEffect } from 'preact/hooks'
import type { UvEdge } from '../../shell/gltf/extract-uvs'
import { drawUvOverlay } from '../../shell/canvas/draw-uv-overlay'

export type UvOverlayCanvasProps = {
  readonly width: number
  readonly height: number
  readonly edges: readonly UvEdge[]
  readonly isVisible: boolean
}

export const UvOverlayCanvas = (props: UvOverlayCanvasProps): JSX.Element | null => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const context = canvas.getContext('2d')
    if (context === null) return

    context.clearRect(0, 0, props.width, props.height)

    if (props.isVisible && props.edges.length > 0) {
      drawUvOverlay({
        context,
        edges: props.edges,
        canvasWidth: props.width,
        canvasHeight: props.height,
        strokeColor: '#00ffff',
        lineWidth: 0.5,
      })
    }
  }, [props.edges, props.isVisible, props.width, props.height])

  if (!props.isVisible) return null

  return (
    <canvas
      ref={canvasRef}
      class="uv-overlay-canvas"
      width={props.width}
      height={props.height}
      style={{ pointerEvents: 'none' }}
    />
  )
}
