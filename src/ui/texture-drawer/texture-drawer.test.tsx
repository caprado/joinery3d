/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { textureId } from '../../schema/ids'
import type { Texture } from '../../schema/texture'
import { TextureDrawer } from './texture-drawer'

const skinPale: Texture = {
  id: textureId('skin_pale'),
  name: 'Pale Skin',
  file: 'textures/skin_pale.png',
  width: 64,
  height: 64,
  tags: ['skin'],
}

const skinDark: Texture = {
  id: textureId('skin_dark'),
  name: 'Dark Skin',
  file: 'textures/skin_dark.png',
  width: 64,
  height: 64,
  tags: ['skin'],
}

const metalDark: Texture = {
  id: textureId('metal_dark'),
  name: 'Dark Metal',
  file: 'textures/metal_dark.png',
  width: 64,
  height: 64,
  tags: ['metal'],
}

const allTextures = [skinPale, skinDark, metalDark]

const defaultProps = {
  isOpen: true,
  channel: 'diffuse' as const,
  textures: allTextures,
  currentTextureId: 'skin_pale',
  onTextureSelected: vi.fn(),
  onTextureRemoved: vi.fn(),
  onImportTexture: vi.fn(),
  onClose: vi.fn(),
}

describe('TextureDrawer', () => {
  it('renders nothing when closed', () => {
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} isOpen={false} />, container)
    expect(container.querySelector('.texture-drawer')).toBeNull()
  })

  it('displays the channel name in the title', () => {
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} />, container)
    expect(container.textContent).toContain('diffuse')
  })

  it('renders all textures as grid items', () => {
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} />, container)
    const items = container.querySelectorAll('.texture-grid-item')
    expect(items.length).toBe(3)
  })

  it('highlights the currently selected texture', () => {
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} />, container)
    const selected = container.querySelector('.texture-grid-item--selected')
    expect(selected?.textContent).toContain('Pale Skin')
  })

  it('calls onTextureSelected when a texture is clicked', () => {
    const onTextureSelected = vi.fn()
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} onTextureSelected={onTextureSelected} />, container)

    const items = container.querySelectorAll('.texture-grid-item')
    if (items[1] instanceof HTMLElement) {
      items[1].click()
    }
    expect(onTextureSelected).toHaveBeenCalledWith('skin_dark')
  })

  it('calls onTextureRemoved when Remove is clicked', () => {
    const onTextureRemoved = vi.fn()
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} onTextureRemoved={onTextureRemoved} />, container)

    const removeButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Remove Texture',
    )
    removeButton?.click()
    expect(onTextureRemoved).toHaveBeenCalledOnce()
  })

  it('disables Remove when no texture is selected', () => {
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} currentTextureId={undefined} />, container)

    const removeButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Remove Texture',
    )
    expect(removeButton?.disabled).toBe(true)
  })

  it('filters textures by search query', async () => {
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} />, container)

    const searchInput = container.querySelector('.texture-drawer-search-input')
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = 'Metal'
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const items = container.querySelectorAll('.texture-grid-item')
    expect(items.length).toBe(1)
    expect(container.textContent).toContain('Dark Metal')
  })

  it('shows empty message when no textures match', async () => {
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} />, container)

    const searchInput = container.querySelector('.texture-drawer-search-input')
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = 'nonexistent'
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    expect(container.textContent).toContain('No textures found')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    const container = document.createElement('div')
    render(<TextureDrawer {...defaultProps} onClose={onClose} />, container)

    const closeButton = container.querySelector('.texture-drawer-close')
    if (closeButton instanceof HTMLElement) {
      closeButton.click()
    }
    expect(onClose).toHaveBeenCalledOnce()
  })
})
