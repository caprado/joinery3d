/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { partId, textureId } from '../../schema/ids'
import type { SlotAssignment } from '../../schema/instance'
import { PropertiesPanel } from './properties-panel'
import type { TextureAssignment } from './texture-section'

const testAssignment: SlotAssignment = {
  partId: partId('head_male_base'),
  offset: { position: [0.1, 0.2, 0.3], rotation: [0.4, 0.5, 0.6], scale: 2 },
  textures: { diffuse: textureId('skin_pale') },
}

const textureAssignments: readonly TextureAssignment[] = [
  { channel: 'diffuse', textureId: 'skin_pale', textureName: 'Pale Skin' },
]

const defaultProps = {
  slotName: 'Head',
  partName: 'Male Head (Base)',
  assignment: testAssignment,
  toolMode: 'translate' as const,
  textureAssignments,
  onToolModeChanged: vi.fn(),
  onOffsetChanged: vi.fn(),
  onResetOffset: vi.fn(),
  onSaveAsPartDefault: vi.fn(),
}

describe('PropertiesPanel', () => {
  it('shows empty message when no assignment', () => {
    const container = document.createElement('div')
    render(
      <PropertiesPanel {...defaultProps} assignment={undefined} slotName={undefined} partName={undefined} />,
      container,
    )
    expect(container.textContent).toContain('Select a slot to view properties')
  })

  it('displays slot name and part name', () => {
    const container = document.createElement('div')
    render(<PropertiesPanel {...defaultProps} />, container)
    expect(container.textContent).toContain('Head')
    expect(container.textContent).toContain('Male Head (Base)')
  })

  it('displays position values', () => {
    const container = document.createElement('div')
    render(<PropertiesPanel {...defaultProps} />, container)
    expect(container.textContent).toContain('0.100')
    expect(container.textContent).toContain('0.200')
    expect(container.textContent).toContain('0.300')
  })

  it('displays rotation values', () => {
    const container = document.createElement('div')
    render(<PropertiesPanel {...defaultProps} />, container)
    expect(container.textContent).toContain('0.400')
    expect(container.textContent).toContain('0.500')
    expect(container.textContent).toContain('0.600')
  })

  it('displays uniform scale', () => {
    const container = document.createElement('div')
    render(<PropertiesPanel {...defaultProps} />, container)
    expect(container.textContent).toContain('Uniform: 2.000')
  })

  it('displays tool mode buttons with active state', () => {
    const container = document.createElement('div')
    render(<PropertiesPanel {...defaultProps} toolMode="rotate" />, container)
    const activeButton = container.querySelector('.tool-button--active')
    expect(activeButton?.textContent).toBe('Rotate')
  })

  it('calls onToolModeChanged when a tool button is clicked', () => {
    const onToolModeChanged = vi.fn()
    const container = document.createElement('div')
    render(<PropertiesPanel {...defaultProps} onToolModeChanged={onToolModeChanged} />, container)
    const buttons = container.querySelectorAll('.tool-button')
    if (buttons[1] instanceof HTMLElement) {
      buttons[1].click()
    }
    expect(onToolModeChanged).toHaveBeenCalledWith('rotate')
  })

  it('calls onResetOffset when Reset is clicked', () => {
    const onResetOffset = vi.fn()
    const container = document.createElement('div')
    render(<PropertiesPanel {...defaultProps} onResetOffset={onResetOffset} />, container)
    const resetButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Reset',
    )
    resetButton?.click()
    expect(onResetOffset).toHaveBeenCalledOnce()
  })

  it('calls onSaveAsPartDefault when Save as Part Default is clicked', () => {
    const onSaveAsPartDefault = vi.fn()
    const container = document.createElement('div')
    render(
      <PropertiesPanel {...defaultProps} onSaveAsPartDefault={onSaveAsPartDefault} />,
      container,
    )
    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Save as Part Default',
    )
    saveButton?.click()
    expect(onSaveAsPartDefault).toHaveBeenCalledOnce()
  })

  it('displays texture assignments', () => {
    const container = document.createElement('div')
    render(<PropertiesPanel {...defaultProps} />, container)
    expect(container.textContent).toContain('diffuse')
    expect(container.textContent).toContain('Pale Skin')
  })
})
