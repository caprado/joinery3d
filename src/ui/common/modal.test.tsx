/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { Modal } from './modal'

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    const container = document.createElement('div')
    render(
      <Modal isOpen={false} title="Test" onClose={() => undefined}>
        <p>Content</p>
      </Modal>,
      container,
    )
    expect(container.querySelector('.modal-overlay')).toBeNull()
  })

  it('renders the overlay and content when isOpen is true', () => {
    const container = document.createElement('div')
    render(
      <Modal isOpen={true} title="Test Modal" onClose={() => undefined}>
        <p>Hello</p>
      </Modal>,
      container,
    )
    expect(container.querySelector('.modal-overlay')).not.toBeNull()
    expect(container.querySelector('.modal-content')).not.toBeNull()
    expect(container.querySelector('.modal-title')?.textContent).toBe('Test Modal')
    expect(container.querySelector('.modal-body')?.textContent).toBe('Hello')
  })

  it('calls onClose when the overlay is clicked', () => {
    const handleClose = vi.fn()
    const container = document.createElement('div')
    render(
      <Modal isOpen={true} title="Test" onClose={handleClose}>
        <p>Content</p>
      </Modal>,
      container,
    )
    const overlay = container.querySelector('.modal-overlay')
    if (overlay instanceof HTMLElement) {
      overlay.click()
    }
    expect(handleClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the close button is clicked', () => {
    const handleClose = vi.fn()
    const container = document.createElement('div')
    render(
      <Modal isOpen={true} title="Test" onClose={handleClose}>
        <p>Content</p>
      </Modal>,
      container,
    )
    const closeButton = container.querySelector('.modal-close')
    if (closeButton instanceof HTMLElement) {
      closeButton.click()
    }
    expect(handleClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when modal content is clicked', () => {
    const handleClose = vi.fn()
    const container = document.createElement('div')
    render(
      <Modal isOpen={true} title="Test" onClose={handleClose}>
        <p>Content</p>
      </Modal>,
      container,
    )
    const content = container.querySelector('.modal-content')
    if (content instanceof HTMLElement) {
      content.click()
    }
    expect(handleClose).not.toHaveBeenCalled()
  })
})
