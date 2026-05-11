/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render } from 'preact'
import { Icon } from './icon'

describe('Icon', () => {
  it('renders a span with the icon name class', () => {
    const container = document.createElement('div')
    render(<Icon name="translate" />, container)

    const span = container.querySelector('span')
    expect(span).not.toBeNull()
    expect(span?.classList.contains('icon')).toBe(true)
    expect(span?.classList.contains('icon--translate')).toBe(true)
  })

  it('defaults to 16px size', () => {
    const container = document.createElement('div')
    render(<Icon name="save" />, container)

    const span = container.querySelector('span')
    expect(span?.style.width).toBe('16px')
    expect(span?.style.height).toBe('16px')
  })

  it('respects custom size', () => {
    const container = document.createElement('div')
    render(<Icon name="export" size={24} />, container)

    const span = container.querySelector('span')
    expect(span?.style.width).toBe('24px')
    expect(span?.style.height).toBe('24px')
  })

  it('is hidden from accessibility tree', () => {
    const container = document.createElement('div')
    render(<Icon name="rotate" />, container)

    const span = container.querySelector('span')
    expect(span?.getAttribute('aria-hidden')).toBe('true')
  })
})
