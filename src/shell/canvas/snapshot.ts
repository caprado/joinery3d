import type { CanvasSnapshot } from '../../core/canvas-painter'

export const takeCanvasSnapshot = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): CanvasSnapshot => {
  const imageData = context.getImageData(0, 0, width, height)
  return {
    data: Array.from(imageData.data),
    width: imageData.width,
    height: imageData.height,
  }
}

export const restoreCanvasSnapshot = (
  context: CanvasRenderingContext2D,
  snapshot: CanvasSnapshot,
): void => {
  const clampedData = new Uint8ClampedArray(snapshot.data)
  const imageData = new ImageData(clampedData, snapshot.width, snapshot.height)
  context.putImageData(imageData, 0, 0)
}
