/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { ImportPartDialog } from './import-part-dialog'

describe('ImportPartDialog', () => {
  it('renders nothing when closed', () => {
    const container = document.createElement('div')
    render(
      <ImportPartDialog
        isOpen={false}
        fileName="test.glb"
        onConfirm={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    expect(container.querySelector('.modal-overlay')).toBeNull()
  })

  it('renders the dialog when open', () => {
    const container = document.createElement('div')
    render(
      <ImportPartDialog
        isOpen={true}
        fileName="dragon_head.glb"
        onConfirm={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('Import Part')
    expect(container.textContent).toContain('dragon_head.glb')
  })

  it('pre-fills the name from fileName without .glb extension', () => {
    const container = document.createElement('div')
    render(
      <ImportPartDialog
        isOpen={true}
        fileName="dragon_head.glb"
        onConfirm={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    const nameInput = container.querySelector('.import-part-input')
    if (nameInput instanceof HTMLInputElement) {
      expect(nameInput.value).toBe('dragon_head')
    }
  })

  it('calls onConfirm with name and parsed tags', async () => {
    const onConfirm = vi.fn()
    const container = document.createElement('div')
    render(
      <ImportPartDialog
        isOpen={true}
        fileName="test.glb"
        onConfirm={onConfirm}
        onClose={() => undefined}
      />,
      container,
    )

    const nameInput = container.querySelector('.import-part-input')
    if (nameInput instanceof HTMLInputElement) {
      nameInput.value = 'My Part'
      nameInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    const tagsInput = container.querySelector('.import-part-tags-input')
    if (tagsInput instanceof HTMLInputElement) {
      tagsInput.value = 'head, torso'
      tagsInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const importButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Import',
    )
    importButton?.click()

    expect(onConfirm).toHaveBeenCalledWith('My Part', ['head', 'torso'])
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    const container = document.createElement('div')
    render(
      <ImportPartDialog
        isOpen={true}
        fileName="test.glb"
        onConfirm={() => undefined}
        onClose={onClose}
      />,
      container,
    )
    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancel',
    )
    cancelButton?.click()
    expect(onClose).toHaveBeenCalledOnce()
  })
})
