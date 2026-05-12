/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import type { Transform } from '../../schema/transform'
import { TransformControls } from './transform-controls'

const testOffset: Transform = {
  position: [1.5, 2.5, 3.5],
  rotation: [0.1, 0.2, 0.3],
  scale: 2,
}

const defaultProps = {
  offset: testOffset,
  toolMode: 'translate' as const,
  onToolModeChanged: vi.fn(),
  onOffsetChanged: vi.fn(),
  onResetOffset: vi.fn(),
  onSaveAsPartDefault: vi.fn(),
}

describe('TransformControls', () => {
  it('renders tool mode buttons', () => {
    const container = document.createElement('div')
    render(<TransformControls {...defaultProps} />, container)
    const buttons = container.querySelectorAll('.tool-button')
    expect(buttons.length).toBe(3)
    expect(buttons[0]?.textContent).toBe('Translate')
    expect(buttons[1]?.textContent).toBe('Rotate')
    expect(buttons[2]?.textContent).toBe('Scale')
  })

  it('highlights the active tool mode', () => {
    const container = document.createElement('div')
    render(<TransformControls {...defaultProps} toolMode="scale" />, container)
    const active = container.querySelector('.tool-button--active')
    expect(active?.textContent).toBe('Scale')
  })

  it('calls onToolModeChanged when a mode button is clicked', () => {
    const onToolModeChanged = vi.fn()
    const container = document.createElement('div')
    render(<TransformControls {...defaultProps} onToolModeChanged={onToolModeChanged} />, container)
    const buttons = container.querySelectorAll('.tool-button')
    if (buttons[1] instanceof HTMLElement) {
      buttons[1].click()
    }
    expect(onToolModeChanged).toHaveBeenCalledWith('rotate')
  })

  it('renders position inputs with current values', () => {
    const container = document.createElement('div')
    render(<TransformControls {...defaultProps} />, container)
    const inputs = container.querySelectorAll('.transform-axis-input-field')
    // 9 inputs: 3 position + 3 rotation + 3 scale
    expect(inputs.length).toBe(9)
    const positionX = inputs[0]
    if (positionX instanceof HTMLInputElement) {
      expect(positionX.value).toBe('1.500')
    }
  })

  it('calls onOffsetChanged when a position input changes', () => {
    const onOffsetChanged = vi.fn()
    const container = document.createElement('div')
    render(<TransformControls {...defaultProps} onOffsetChanged={onOffsetChanged} />, container)
    const inputs = container.querySelectorAll('.transform-axis-input-field')
    const positionY = inputs[1]
    if (positionY instanceof HTMLInputElement) {
      positionY.value = '5.0'
      positionY.dispatchEvent(new Event('input', { bubbles: true }))
    }
    expect(onOffsetChanged).toHaveBeenCalledWith({
      ...testOffset,
      position: [1.5, 5.0, 3.5],
    })
  })

  it('calls onOffsetChanged when a rotation input changes', () => {
    const onOffsetChanged = vi.fn()
    const container = document.createElement('div')
    render(<TransformControls {...defaultProps} onOffsetChanged={onOffsetChanged} />, container)
    const inputs = container.querySelectorAll('.transform-axis-input-field')
    const rotZ = inputs[5]
    if (rotZ instanceof HTMLInputElement) {
      rotZ.value = '1.0'
      rotZ.dispatchEvent(new Event('input', { bubbles: true }))
    }
    expect(onOffsetChanged).toHaveBeenCalledWith({
      ...testOffset,
      rotation: [0.1, 0.2, 1.0],
    })
  })

  it('calls onOffsetChanged when a scale input changes', () => {
    const onOffsetChanged = vi.fn()
    const container = document.createElement('div')
    render(<TransformControls {...defaultProps} onOffsetChanged={onOffsetChanged} />, container)
    const inputs = container.querySelectorAll('.transform-axis-input-field')
    const scaleX = inputs[6]
    if (scaleX instanceof HTMLInputElement) {
      scaleX.value = '3.0'
      scaleX.dispatchEvent(new Event('input', { bubbles: true }))
    }
    expect(onOffsetChanged).toHaveBeenCalledWith({
      ...testOffset,
      scale: [3.0, 2, 2],
    })
  })

  it('calls onResetOffset when Reset button is clicked', () => {
    const onResetOffset = vi.fn()
    const container = document.createElement('div')
    render(<TransformControls {...defaultProps} onResetOffset={onResetOffset} />, container)
    const resetButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Reset',
    )
    resetButton?.click()
    expect(onResetOffset).toHaveBeenCalledOnce()
  })

  it('calls onSaveAsPartDefault when Save button is clicked', () => {
    const onSaveAsPartDefault = vi.fn()
    const container = document.createElement('div')
    render(
      <TransformControls {...defaultProps} onSaveAsPartDefault={onSaveAsPartDefault} />,
      container,
    )
    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Save as Part Default',
    )
    saveButton?.click()
    expect(onSaveAsPartDefault).toHaveBeenCalledOnce()
  })
})
