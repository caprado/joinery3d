/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { partId, slotTag, textureId } from '../../schema/ids'
import type { Part } from '../../schema/part'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import { emptyLibrary } from '../../schema/library'
import { buildIndexFromParts } from '../../core/library-index'
import { LibraryPanel } from './library-panel'

const headTag = slotTag('head')

const headPart: Part = {
  id: partId('head_male_base'),
  name: 'Male Head (Base)',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: textureId('skin_pale') }],
  thumbnailFile: undefined,
}

const headElfPart: Part = {
  id: partId('head_elf'),
  name: 'Elf Head',
  tags: [headTag],
  meshFile: 'parts/head/head_elf.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const library = buildIndexFromParts([], [headPart, headElfPart], [])

describe('LibraryPanel', () => {
  it('renders a list of available parts', () => {
    const container = document.createElement('div')
    render(
      <LibraryPanel
        availableParts={[headPart, headElfPart]}
        library={library}
        onPartSelected={() => undefined}
      />,
      container,
    )
    const items = container.querySelectorAll('.library-part-item')
    expect(items.length).toBe(2)
  })

  it('displays part names', () => {
    const container = document.createElement('div')
    render(
      <LibraryPanel
        availableParts={[headPart, headElfPart]}
        library={library}
        onPartSelected={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('Male Head (Base)')
    expect(container.textContent).toContain('Elf Head')
  })

  it('calls onPartSelected when a part is clicked', () => {
    const onPartSelected = vi.fn()
    const container = document.createElement('div')
    render(
      <LibraryPanel
        availableParts={[headPart]}
        library={library}
        onPartSelected={onPartSelected}
      />,
      container,
    )
    const button = container.querySelector('.library-part-item-button')
    if (button instanceof HTMLElement) {
      button.click()
    }
    expect(onPartSelected).toHaveBeenCalledWith('head_male_base')
  })

  it('shows empty message when no parts available', () => {
    const container = document.createElement('div')
    render(
      <LibraryPanel
        availableParts={[]}
        library={emptyLibrary}
        onPartSelected={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('No parts available')
  })

  it('renders a search input', () => {
    const container = document.createElement('div')
    render(
      <LibraryPanel
        availableParts={[headPart, headElfPart]}
        library={library}
        onPartSelected={() => undefined}
      />,
      container,
    )
    const input = container.querySelector('.library-search-input')
    expect(input).not.toBeNull()
  })

  it('filters parts when search query is typed', async () => {
    const container = document.createElement('div')
    render(
      <LibraryPanel
        availableParts={[headPart, headElfPart]}
        library={library}
        onPartSelected={() => undefined}
      />,
      container,
    )

    const input = container.querySelector('.library-search-input')
    if (input instanceof HTMLInputElement) {
      input.value = 'Elf'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }

    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const items = container.querySelectorAll('.library-part-item')
    expect(items.length).toBe(1)
    expect(container.textContent).toContain('Elf Head')
    expect(container.textContent).not.toContain('Male Head')
  })

  it('restores full list when search is cleared', async () => {
    const container = document.createElement('div')
    render(
      <LibraryPanel
        availableParts={[headPart, headElfPart]}
        library={library}
        onPartSelected={() => undefined}
      />,
      container,
    )

    const input = container.querySelector('.library-search-input')
    if (input instanceof HTMLInputElement) {
      input.value = 'Elf'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    if (input instanceof HTMLInputElement) {
      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const items = container.querySelectorAll('.library-part-item')
    expect(items.length).toBe(2)
  })
})
