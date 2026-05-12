/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import { PartOffsetEditor } from './part-offset-editor'

const defaultProps = {
  partName: 'Male Head (Base)',
  defaultOffset: IDENTITY_TRANSFORM,
  toolMode: 'translate' as const,
  onToolModeChanged: vi.fn(),
  onOffsetChanged: vi.fn(),
  onSave: vi.fn(),
  onClose: vi.fn(),
}

describe('PartOffsetEditor', () => {
  it('renders the part name', () => {
    const container = document.createElement('div')
    render(<PartOffsetEditor {...defaultProps} />, container)
    expect(container.textContent).toContain('Male Head (Base)')
  })

  it('renders the title', () => {
    const container = document.createElement('div')
    render(<PartOffsetEditor {...defaultProps} />, container)
    expect(container.textContent).toContain('Edit Default Offset')
  })

  it('renders transform controls with 9 axis inputs', () => {
    const container = document.createElement('div')
    render(<PartOffsetEditor {...defaultProps} />, container)
    const inputs = container.querySelectorAll('.transform-axis-input-field')
    expect(inputs.length).toBe(9)
  })

  it('calls onClose when Done is clicked', () => {
    const onClose = vi.fn()
    const container = document.createElement('div')
    render(<PartOffsetEditor {...defaultProps} onClose={onClose} />, container)
    const doneButton = container.querySelector('.part-offset-editor-close')
    if (doneButton instanceof HTMLElement) {
      doneButton.click()
    }
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onSave when Save as Part Default is clicked', () => {
    const onSave = vi.fn()
    const container = document.createElement('div')
    render(<PartOffsetEditor {...defaultProps} onSave={onSave} />, container)
    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Save as Part Default',
    )
    saveButton?.click()
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('calls onOffsetChanged with identity when Reset is clicked', () => {
    const onOffsetChanged = vi.fn()
    const container = document.createElement('div')
    render(
      <PartOffsetEditor
        {...defaultProps}
        defaultOffset={{ position: [1, 2, 3], rotation: [0, 0, 0], scale: 2 }}
        onOffsetChanged={onOffsetChanged}
      />,
      container,
    )
    const resetButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Reset',
    )
    resetButton?.click()
    expect(onOffsetChanged).toHaveBeenCalledWith({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    })
  })
})
