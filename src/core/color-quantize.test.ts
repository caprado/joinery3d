import { describe, it, expect } from 'vitest'
import { quantizeImage } from './color-quantize'

describe('quantizeImage', () => {
  it('quantizes a single-color image to one palette entry', () => {
    const pixels = [255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255]
    const result = quantizeImage({
      pixels,
      width: 2,
      height: 2,
      maxColors: 256,
    })

    expect(result.palette).toHaveLength(1)
    expect(result.palette[0]?.red).toBe(255)
    expect(result.palette[0]?.green).toBe(0)
    expect(result.palette[0]?.blue).toBe(0)
    expect(result.indices).toHaveLength(4)
    expect(result.indices.every((index) => index === 0)).toBe(true)
  })

  it('quantizes a two-color image to two palette entries', () => {
    const pixels = [
      255, 0, 0, 255,
      0, 0, 255, 255,
    ]
    const result = quantizeImage({
      pixels,
      width: 2,
      height: 1,
      maxColors: 256,
    })

    expect(result.palette.length).toBeLessThanOrEqual(2)
    expect(result.indices).toHaveLength(2)
  })

  it('reduces colors when more unique colors than maxColors', () => {
    const pixels: number[] = []
    for (let colorIndex = 0; colorIndex < 512; colorIndex++) {
      pixels.push(colorIndex % 256, (colorIndex * 7) % 256, (colorIndex * 13) % 256, 255)
    }

    const result = quantizeImage({
      pixels,
      width: 512,
      height: 1,
      maxColors: 16,
    })

    expect(result.palette.length).toBeLessThanOrEqual(16)
    expect(result.indices).toHaveLength(512)
  })

  it('preserves dimensions in the result', () => {
    const pixels = [0, 0, 0, 255, 255, 255, 255, 255]
    const result = quantizeImage({
      pixels,
      width: 2,
      height: 1,
      maxColors: 256,
    })

    expect(result.width).toBe(2)
    expect(result.height).toBe(1)
  })

  it('palette values are in 0-255 range', () => {
    const pixels = [128, 64, 32, 255]
    const result = quantizeImage({
      pixels,
      width: 1,
      height: 1,
      maxColors: 256,
    })

    for (const entry of result.palette) {
      expect(entry.red).toBeGreaterThanOrEqual(0)
      expect(entry.red).toBeLessThanOrEqual(255)
      expect(entry.green).toBeGreaterThanOrEqual(0)
      expect(entry.green).toBeLessThanOrEqual(255)
      expect(entry.blue).toBeGreaterThanOrEqual(0)
      expect(entry.blue).toBeLessThanOrEqual(255)
    }
  })
})
