/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts'

const TestComponent = (props: { onUndo: () => void; onRedo: () => void }) => {
  useKeyboardShortcuts({ onUndo: props.onUndo, onRedo: props.onRedo })
  return null
}

const flush = async (): Promise<void> => {
  await new Promise((resolve) => { setTimeout(resolve, 0) })
  await new Promise((resolve) => { setTimeout(resolve, 0) })
}

describe('useKeyboardShortcuts', () => {
  it('calls onUndo on Ctrl+Z', async () => {
    const onUndo = vi.fn()
    const onRedo = vi.fn()
    const container = document.createElement('div')
    render(<TestComponent onUndo={onUndo} onRedo={onRedo} />, container)
    await flush()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }))
    expect(onUndo).toHaveBeenCalledOnce()
    expect(onRedo).not.toHaveBeenCalled()
  })

  it('calls onRedo on Ctrl+Y', async () => {
    const onUndo = vi.fn()
    const onRedo = vi.fn()
    const container = document.createElement('div')
    render(<TestComponent onUndo={onUndo} onRedo={onRedo} />, container)
    await flush()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true }))
    expect(onRedo).toHaveBeenCalledOnce()
  })

  it('calls onRedo on Ctrl+Shift+Z', async () => {
    const onUndo = vi.fn()
    const onRedo = vi.fn()
    const container = document.createElement('div')
    render(<TestComponent onUndo={onUndo} onRedo={onRedo} />, container)
    await flush()

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true }),
    )
    expect(onRedo).toHaveBeenCalledOnce()
    expect(onUndo).not.toHaveBeenCalled()
  })

  it('does not fire on plain Z without modifier', async () => {
    const onUndo = vi.fn()
    const onRedo = vi.fn()
    const container = document.createElement('div')
    render(<TestComponent onUndo={onUndo} onRedo={onRedo} />, container)
    await flush()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))
    expect(onUndo).not.toHaveBeenCalled()
  })
})
