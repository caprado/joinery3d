/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import type { MeshInfo } from '../../shell/gltf/inspect'
import { NewTemplateWizard } from './new-template-wizard'

const testMeshes: readonly MeshInfo[] = [
  { name: 'Body', position: [0, 0, 0] },
  { name: 'Hood', position: [0, 1, 2] },
]

describe('NewTemplateWizard', () => {
  it('renders nothing when closed', () => {
    const container = document.createElement('div')
    render(
      <NewTemplateWizard
        isOpen={false}
        meshes={testMeshes}
        onSave={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    expect(container.querySelector('.modal-overlay')).toBeNull()
  })

  it('lists meshes when open', () => {
    const container = document.createElement('div')
    render(
      <NewTemplateWizard
        isOpen={true}
        meshes={testMeshes}
        onSave={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('Body')
    expect(container.textContent).toContain('Hood')
  })

  it('shows empty message when no meshes', () => {
    const container = document.createElement('div')
    render(
      <NewTemplateWizard
        isOpen={true}
        meshes={[]}
        onSave={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('No meshes found')
  })

  it('calls onSave with template name, description, and slot configs', async () => {
    const onSave = vi.fn()
    const container = document.createElement('div')
    render(
      <NewTemplateWizard
        isOpen={true}
        meshes={testMeshes}
        onSave={onSave}
        onClose={() => undefined}
      />,
      container,
    )

    const nameInput = container.querySelector('.new-template-name-input')
    if (nameInput instanceof HTMLInputElement) {
      nameInput.value = 'Vehicle'
      nameInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    const descInput = container.querySelector('.new-template-description-input')
    if (descInput instanceof HTMLInputElement) {
      descInput.value = 'A car'
      descInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    await new Promise((resolve) => { setTimeout(resolve, 0) })

    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Save Template',
    )
    saveButton?.click()

    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0]?.[0]).toBe('Vehicle')
    expect(onSave.mock.calls[0]?.[1]).toBe('A car')
    expect(onSave.mock.calls[0]?.[2]).toHaveLength(2)
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    const container = document.createElement('div')
    render(
      <NewTemplateWizard
        isOpen={true}
        meshes={testMeshes}
        onSave={() => undefined}
        onClose={onClose}
      />,
      container,
    )
    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancel',
    )
    cancelButton?.click()
    expect(onClose).toHaveBeenCalledOnce()
  })
})
