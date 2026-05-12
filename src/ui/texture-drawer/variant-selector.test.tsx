/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { textureId } from '../../schema/ids'
import type { TextureVariant } from '../../schema/part'
import { VariantSelector } from './variant-selector'

const variants: readonly TextureVariant[] = [
  { name: 'Default', textureId: textureId('skin_pale') },
  { name: 'Damaged', textureId: textureId('skin_damaged') },
  { name: 'Alt Color', textureId: textureId('skin_dark') },
]

describe('VariantSelector', () => {
  it('renders nothing when no variants', () => {
    const container = document.createElement('div')
    render(
      <VariantSelector
        variants={[]}
        currentTextureId={undefined}
        onVariantSelected={() => undefined}
      />,
      container,
    )
    expect(container.querySelector('.variant-selector')).toBeNull()
  })

  it('renders a button for each variant', () => {
    const container = document.createElement('div')
    render(
      <VariantSelector
        variants={variants}
        currentTextureId="skin_pale"
        onVariantSelected={() => undefined}
      />,
      container,
    )
    const buttons = container.querySelectorAll('.variant-selector-item')
    expect(buttons.length).toBe(3)
    expect(container.textContent).toContain('Default')
    expect(container.textContent).toContain('Damaged')
    expect(container.textContent).toContain('Alt Color')
  })

  it('highlights the currently active variant', () => {
    const container = document.createElement('div')
    render(
      <VariantSelector
        variants={variants}
        currentTextureId="skin_damaged"
        onVariantSelected={() => undefined}
      />,
      container,
    )
    const active = container.querySelector('.variant-selector-item--active')
    expect(active?.textContent).toBe('Damaged')
  })

  it('calls onVariantSelected when a variant is clicked', () => {
    const onVariantSelected = vi.fn()
    const container = document.createElement('div')
    render(
      <VariantSelector
        variants={variants}
        currentTextureId="skin_pale"
        onVariantSelected={onVariantSelected}
      />,
      container,
    )
    const buttons = container.querySelectorAll('.variant-selector-item')
    if (buttons[1] instanceof HTMLElement) {
      buttons[1].click()
    }
    expect(onVariantSelected).toHaveBeenCalledWith('skin_damaged')
  })
})
