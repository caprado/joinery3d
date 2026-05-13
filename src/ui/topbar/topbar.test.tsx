/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { Topbar } from './topbar'

const defaultProps = {
  onNewAsset: vi.fn(),
  onOpenProject: vi.fn(),
  onCloseProject: vi.fn(),
  onSave: vi.fn(),
  onSaveAs: vi.fn(),
  onExport: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  hasInstance: false,
  isDirty: false,
  hasProjectPath: false,
  canUndo: false,
  canRedo: false,
}

const findButton = (container: HTMLElement, label: string): HTMLButtonElement | undefined =>
  Array.from(container.querySelectorAll('button')).find(
    (button) => button.textContent === label,
  )

describe('Topbar', () => {
  it('renders the app title', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} />, container)
    expect(container.textContent).toContain('Joinery3D')
  })

  it('renders all action buttons', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} />, container)
    expect(findButton(container, 'New Asset')).toBeDefined()
    expect(findButton(container, 'Open')).toBeDefined()
    expect(findButton(container, 'Save')).toBeDefined()
    expect(findButton(container, 'Save As')).toBeDefined()
    expect(findButton(container, 'Export GLB')).toBeDefined()
    expect(findButton(container, 'Undo')).toBeDefined()
    expect(findButton(container, 'Redo')).toBeDefined()
  })

  it('disables Save, Save As, and Export when no instance exists', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} />, container)
    expect(findButton(container, 'Save')?.disabled).toBe(true)
    expect(findButton(container, 'Save As')?.disabled).toBe(true)
    expect(findButton(container, 'Export GLB')?.disabled).toBe(true)
  })

  it('enables Save As and Export when an instance exists', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} hasInstance={true} />, container)
    expect(findButton(container, 'Save As')?.disabled).toBe(false)
    expect(findButton(container, 'Export GLB')?.disabled).toBe(false)
  })

  it('enables Save only when dirty with a project path', () => {
    const container = document.createElement('div')
    render(
      <Topbar {...defaultProps} hasInstance={true} isDirty={true} hasProjectPath={true} />,
      container,
    )
    expect(findButton(container, 'Save')?.disabled).toBe(false)
  })

  it('keeps Save disabled when dirty but no project path', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} hasInstance={true} isDirty={true} />, container)
    expect(findButton(container, 'Save')?.disabled).toBe(true)
  })

  it('disables Undo/Redo when history is empty', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} />, container)
    expect(findButton(container, 'Undo')?.disabled).toBe(true)
    expect(findButton(container, 'Redo')?.disabled).toBe(true)
  })

  it('enables Undo when canUndo is true', () => {
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} canUndo={true} />, container)
    expect(findButton(container, 'Undo')?.disabled).toBe(false)
  })

  it('calls onNewAsset when New Asset is clicked', () => {
    const onNewAsset = vi.fn()
    const container = document.createElement('div')
    render(<Topbar {...defaultProps} onNewAsset={onNewAsset} />, container)
    findButton(container, 'New Asset')?.click()
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
    findButton(container, 'Save')?.click()
    expect(onSave).toHaveBeenCalledOnce()
  })
})
