import type { PainterColor } from '../../core/canvas-painter'

const colorToRgba = (color: PainterColor): string =>
  `rgba(${String(color.red)}, ${String(color.green)}, ${String(color.blue)}, ${String(color.alpha / 255)})`

export type BrushStrokeArgs = {
  readonly context: CanvasRenderingContext2D
  readonly fromX: number
  readonly fromY: number
  readonly toX: number
  readonly toY: number
  readonly brushSize: number
  readonly color: PainterColor
}

export const drawBrushStroke = (args: BrushStrokeArgs): void => {
  args.context.globalCompositeOperation = 'source-over'
  args.context.strokeStyle = colorToRgba(args.color)
  args.context.lineWidth = args.brushSize
  args.context.lineCap = 'round'
  args.context.lineJoin = 'round'
  args.context.beginPath()
  args.context.moveTo(args.fromX, args.fromY)
  args.context.lineTo(args.toX, args.toY)
  args.context.stroke()
}

export type EraserStrokeArgs = {
  readonly context: CanvasRenderingContext2D
  readonly fromX: number
  readonly fromY: number
  readonly toX: number
  readonly toY: number
  readonly brushSize: number
}

export const drawEraserStroke = (args: EraserStrokeArgs): void => {
  args.context.globalCompositeOperation = 'destination-out'
  args.context.lineWidth = args.brushSize
  args.context.lineCap = 'round'
  args.context.lineJoin = 'round'
  args.context.beginPath()
  args.context.moveTo(args.fromX, args.fromY)
  args.context.lineTo(args.toX, args.toY)
  args.context.stroke()
  args.context.globalCompositeOperation = 'source-over'
}

export type FloodFillArgs = {
  readonly context: CanvasRenderingContext2D
  readonly startX: number
  readonly startY: number
  readonly color: PainterColor
  readonly width: number
  readonly height: number
}

export const floodFill = (args: FloodFillArgs): void => {
  const imageData = args.context.getImageData(0, 0, args.width, args.height)
  const pixels = imageData.data
  const targetIndex = (Math.floor(args.startY) * args.width + Math.floor(args.startX)) * 4

  const targetRed = pixels[targetIndex] ?? 0
  const targetGreen = pixels[targetIndex + 1] ?? 0
  const targetBlue = pixels[targetIndex + 2] ?? 0
  const targetAlpha = pixels[targetIndex + 3] ?? 0

  if (
    targetRed === args.color.red &&
    targetGreen === args.color.green &&
    targetBlue === args.color.blue &&
    targetAlpha === args.color.alpha
  ) {
    return
  }

  const stack: Array<readonly [number, number]> = [[Math.floor(args.startX), Math.floor(args.startY)]]
  const visited = new Set<number>()

  while (stack.length > 0) {
    const current = stack.pop()
    if (current === undefined) break
    const [currentX, currentY] = current
    const index = (currentY * args.width + currentX) * 4

    if (visited.has(index)) continue
    visited.add(index)

    const pixelRed = pixels[index] ?? 0
    const pixelGreen = pixels[index + 1] ?? 0
    const pixelBlue = pixels[index + 2] ?? 0
    const pixelAlpha = pixels[index + 3] ?? 0

    if (
      pixelRed !== targetRed ||
      pixelGreen !== targetGreen ||
      pixelBlue !== targetBlue ||
      pixelAlpha !== targetAlpha
    ) {
      continue
    }

    pixels[index] = args.color.red
    pixels[index + 1] = args.color.green
    pixels[index + 2] = args.color.blue
    pixels[index + 3] = args.color.alpha

    if (currentX > 0) stack.push([currentX - 1, currentY])
    if (currentX < args.width - 1) stack.push([currentX + 1, currentY])
    if (currentY > 0) stack.push([currentX, currentY - 1])
    if (currentY < args.height - 1) stack.push([currentX, currentY + 1])
  }

  args.context.putImageData(imageData, 0, 0)
}

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) {
        reject(new Error('Failed to convert canvas to blob'))
        return
      }
      void blob.arrayBuffer().then((buffer) => {
        resolve(new Uint8Array(buffer))
      })
    }, 'image/png')
  })
