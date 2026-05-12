import type { UvEdge } from '../gltf/extract-uvs'

export type DrawUvOverlayArgs = {
  readonly context: CanvasRenderingContext2D
  readonly edges: readonly UvEdge[]
  readonly canvasWidth: number
  readonly canvasHeight: number
  readonly strokeColor: string
  readonly lineWidth: number
}

export const drawUvOverlay = (args: DrawUvOverlayArgs): void => {
  args.context.save()
  args.context.strokeStyle = args.strokeColor
  args.context.lineWidth = args.lineWidth
  args.context.globalAlpha = 0.4

  for (const edge of args.edges) {
    args.context.beginPath()
    args.context.moveTo(
      edge.fromU * args.canvasWidth,
      (1 - edge.fromV) * args.canvasHeight,
    )
    args.context.lineTo(
      edge.toU * args.canvasWidth,
      (1 - edge.toV) * args.canvasHeight,
    )
    args.context.stroke()
  }

  args.context.restore()
}
