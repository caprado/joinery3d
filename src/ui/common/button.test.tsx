/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { Button } from './button'

describe('Button', () => {
  it('renders with the given label', () => {
    const container = document.createElement('div')
    render(<Button label="Click me" onClick={() => undefined} />, container)
    expect(container.textContent).toBe('Click me')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    const container = document.createElement('div')
    render(<Button label="Test" onClick={handleClick} />, container)

    const button = container.querySelector('button')
    button?.click()
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when isDisabled is true', () => {
    const container = document.createElement('div')
    render(<Button label="Test" onClick={() => undefined} isDisabled={true} />, container)

    const button = container.querySelector('button')
    expect(button?.disabled).toBe(true)
  })

  it('applies the variant class', () => {
    const container = document.createElement('div')
    render(<Button label="Test" onClick={() => undefined} variant="primary" />, container)

    const button = container.querySelector('button')
    expect(button?.classList.contains('button--primary')).toBe(true)
  })

  it('defaults to secondary variant', () => {
    const container = document.createElement('div')
    render(<Button label="Test" onClick={() => undefined} />, container)

    const button = container.querySelector('button')
    expect(button?.classList.contains('button--secondary')).toBe(true)
  })
})
