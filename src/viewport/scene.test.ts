import { describe, it, expect } from 'vitest'
import { createScene, setGridVisible } from './scene'

describe('createScene', () => {
  it('creates a scene with children', () => {
    const { scene } = createScene()
    expect(scene.children.length).toBeGreaterThan(0)
  })

  it('includes a grid helper', () => {
    const { gridHelper } = createScene()
    expect(gridHelper).toBeDefined()
    expect(gridHelper.visible).toBe(true)
  })

  it('includes ambient light', () => {
    const { scene } = createScene()
    const ambient = scene.children.find((child) => child.type === 'AmbientLight')
    expect(ambient).toBeDefined()
  })

  it('includes directional light', () => {
    const { scene } = createScene()
    const directional = scene.children.find((child) => child.type === 'DirectionalLight')
    expect(directional).toBeDefined()
  })
})

describe('setGridVisible', () => {
  it('hides the grid', () => {
    const setup = createScene()
    setGridVisible(setup, false)
    expect(setup.gridHelper.visible).toBe(false)
  })

  it('shows the grid', () => {
    const setup = createScene()
    setGridVisible(setup, false)
    setGridVisible(setup, true)
    expect(setup.gridHelper.visible).toBe(true)
  })
})
