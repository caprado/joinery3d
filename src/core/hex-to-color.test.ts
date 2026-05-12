import { describe, it, expect } from 'vitest'
import { hexToColor } from './hex-to-color'

describe('hexToColor', () => {
  it('parses a valid hex color', () => {
    const color = hexToColor('#ff8040')
    expect(color).toBeDefined()
    expect(color?.red).toBe(255)
    expect(color?.green).toBe(128)
    expect(color?.blue).toBe(64)
    expect(color?.alpha).toBe(255)
  })

  it('parses black', () => {
    const color = hexToColor('#000000')
    expect(color?.red).toBe(0)
    expect(color?.green).toBe(0)
    expect(color?.blue).toBe(0)
  })

  it('parses white', () => {
    const color = hexToColor('#ffffff')
    expect(color?.red).toBe(255)
    expect(color?.green).toBe(255)
    expect(color?.blue).toBe(255)
  })

  it('is case insensitive', () => {
    const color = hexToColor('#FF8040')
    expect(color?.red).toBe(255)
  })

  it('returns undefined for invalid format', () => {
    expect(hexToColor('not a color')).toBeUndefined()
    expect(hexToColor('#fff')).toBeUndefined()
    expect(hexToColor('')).toBeUndefined()
  })
})
