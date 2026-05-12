/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { EditableText } from './editable-text'

describe('EditableText', () => {
  it('renders the value as text by default', () => {
    const container = document.createElement('div')
    render(<EditableText value="Hello" onCommit={() => undefined} />, container)
    expect(container.textContent).toBe('Hello')
    expect(container.querySelector('input')).toBeNull()
  })

  it('switches to input on double click', async () => {
    const container = document.createElement('div')
    render(<EditableText value="Hello" onCommit={() => undefined} />, container)

    const span = container.querySelector('.editable-text')
    if (span instanceof HTMLElement) {
      span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const input = container.querySelector('input')
    expect(input).not.toBeNull()
    expect(input?.value).toBe('Hello')
  })

  it('calls onCommit with new value on Enter', async () => {
    const onCommit = vi.fn()
    const container = document.createElement('div')
    render(<EditableText value="Hello" onCommit={onCommit} />, container)

    const span = container.querySelector('.editable-text')
    if (span instanceof HTMLElement) {
      span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const input = container.querySelector('input')
    if (input instanceof HTMLInputElement) {
      input.value = 'Updated'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const inputAfterUpdate = container.querySelector('input')
    if (inputAfterUpdate instanceof HTMLInputElement) {
      inputAfterUpdate.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    expect(onCommit).toHaveBeenCalledWith('Updated')
  })

  it('does not call onCommit when value unchanged', async () => {
    const onCommit = vi.fn()
    const container = document.createElement('div')
    render(<EditableText value="Hello" onCommit={onCommit} />, container)

    const span = container.querySelector('.editable-text')
    if (span instanceof HTMLElement) {
      span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const input = container.querySelector('input')
    if (input instanceof HTMLInputElement) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    expect(onCommit).not.toHaveBeenCalled()
  })

  it('cancels editing on Escape', async () => {
    const container = document.createElement('div')
    render(<EditableText value="Hello" onCommit={() => undefined} />, container)

    const span = container.querySelector('.editable-text')
    if (span instanceof HTMLElement) {
      span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const input = container.querySelector('input')
    if (input instanceof HTMLInputElement) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    }
    await new Promise((resolve) => { setTimeout(resolve, 0) })

    expect(container.querySelector('input')).toBeNull()
    expect(container.textContent).toBe('Hello')
  })
})
