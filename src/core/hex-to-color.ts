import type { PainterColor } from './canvas-painter'

export const hexToColor = (hex: string): PainterColor | undefined => {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (match === null) return undefined
  const redHex = match[1]
  const greenHex = match[2]
  const blueHex = match[3]
  if (redHex === undefined || greenHex === undefined || blueHex === undefined) return undefined
  
  return {
    red: parseInt(redHex, 16),
    green: parseInt(greenHex, 16),
    blue: parseInt(blueHex, 16),
    alpha: 255,
  }
}
