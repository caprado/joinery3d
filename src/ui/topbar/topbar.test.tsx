/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { Topbar } from './topbar'

const defaultProps = {
  onNewAsset: vi.fn(),
  onSave: vi.fn(),
  onSaveAs: vi.fn(),
  onExport: vi.fn(),
  hasInstance: false,
  isDirty: false,
  hasProjectPath: false,
}

describe('Topbar', () => {
  it('renders the app title', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} />, container)
    expect(container.textContent).toContain('Joinery3D')
  })

  it('renders all action buttons', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} />, container)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(4)
  })

  it('disables Save, Save As, and Export when no instance exists', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} />, container)
    const buttons = container.querySelectorAll('button')
    const saveButton = buttons[1]
    const saveAsButton = buttons[2]
    const exportButton = buttons[3]
    expect(saveButton?.disabled).toBe(true)
    expect(saveAsButton?.disabled).toBe(true)
    expect(exportButton?.disabled).toBe(true)
  })

  it('enables Save As and Export when an instance exists', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} hasInstance={true} />, container)
    const buttons = container.querySelectorAll('button')
    const saveAsButton = buttons[2]
    const exportButton = buttons[3]
    expect(saveAsButton?.disabled).toBe(false)
    expect(exportButton?.disabled).toBe(false)
  })

  it('enables Save only when dirty with a project path', () => {
    const container = document.createElement('div')
    render(
      <Topbar {...defaultProps} hasInstance={true} isDirty={true} hasProjectPath={true} />,
      container,
    )
    const buttons = container.querySelectorAll('button')
    const saveButton = buttons[1]
    expect(saveButton?.disabled).toBe(false)
  })

  it('keeps Save disabled when dirty but no project path', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} hasInstance={true} isDirty={true} />, container)
    const buttons = container.querySelectorAll('button')
    const saveButton = buttons[1]
    expect(saveButton?.disabled).toBe(true)
  })

  it('calls onNewAsset when New Asset is clicked', () => {
    const onNewAsset = vi.fn()
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} onNewAsset={onNewAsset} />, container)
    const buttons = container.querySelectorAll('button')
    buttons[0]?.click()
    expect(onNewAsset).toHaveBeenCalledOnce()
  })

  it('calls onSave when Save is clicked and enabled', () => {
    const onSave = vi.fn()
    const container = document.createElement('div')
    render(
      <Topbar
        {...defaultProps}
        onSave={onSave}
        hasInstance={true}
        isDirty={true}
        hasProjectPath={true}
      />,
      container,
    )
    const buttons = container.querySelectorAll('button')
    buttons[1]?.click()
    expect(onSave).toHaveBeenCalledOnce()
  })
})
