import { describe, it, expect } from 'vitest'
import { DEFAULT_LOW_RES_CONFIG, createLowResRenderer } from './low-res-renderer'

describe('DEFAULT_LOW_RES_CONFIG', () => {
  it('has 320x240 resolution', () => {
    expect(DEFAULT_LOW_RES_CONFIG.renderWidth).toBe(320)
    expect(DEFAULT_LOW_RES_CONFIG.renderHeight).toBe(240)
  })

  it('is disabled by default', () => {
    expect(DEFAULT_LOW_RES_CONFIG.isEnabled).toBe(false)
  })
})

describe('createLowResRenderer', () => {
  it('creates a renderer with render and dispose methods', () => {
    const renderer = createLowResRenderer(DEFAULT_LOW_RES_CONFIG)
    expect(renderer.render).toBeDefined()
    expect(renderer.dispose).toBeDefined()
  })

  it('dispose does not throw', () => {
    const renderer = createLowResRenderer(DEFAULT_LOW_RES_CONFIG)
    expect(() => {
      renderer.dispose()
    }).not.toThrow()
  })

  it('accepts custom resolution', () => {
    const renderer = createLowResRenderer({
      renderWidth: 512,
      renderHeight: 384,
      isEnabled: true,
    })
    expect(renderer.render).toBeDefined()
    renderer.dispose()
  })
})
