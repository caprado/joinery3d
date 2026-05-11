/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { templateId, slotTag, partId } from '../../schema/ids'
import type { Template } from '../../schema/template'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import { NewAssetModal } from './new-asset-modal'

const templates: readonly Template[] = [
  {
    id: templateId('humanoid'),
    name: 'Humanoid',
    description: 'Basic biped with paired limbs',
    version: 1,
    slots: [
      {
        tag: slotTag('head'),
        name: 'Head',
        anchor: IDENTITY_TRANSFORM,
        defaultPartId: partId('head_male_base'),
        pairedSlot: undefined,
        required: true,
      },
    ],
  },
  {
    id: templateId('chest'),
    name: 'Chest',
    description: 'Container with lid and lock',
    version: 1,
    slots: [],
  },
]

describe('NewAssetModal', () => {
  it('renders nothing when closed', () => {
    const container = document.createElement('div')
    render(
      <NewAssetModal
        isOpen={false}
        templates={templates}
        onTemplateSelected={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    expect(container.querySelector('.modal-overlay')).toBeNull()
  })

  it('lists available templates when open', () => {
    const container = document.createElement('div')
    render(
      <NewAssetModal
        isOpen={true}
        templates={templates}
        onTemplateSelected={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('Humanoid')
    expect(container.textContent).toContain('Basic biped with paired limbs')
    expect(container.textContent).toContain('Chest')
    expect(container.textContent).toContain('Container with lid and lock')
  })

  it('calls onTemplateSelected with the template id when clicked', () => {
    const onTemplateSelected = vi.fn()
    const container = document.createElement('div')
    render(
      <NewAssetModal
        isOpen={true}
        templates={templates}
        onTemplateSelected={onTemplateSelected}
        onClose={() => undefined}
      />,
      container,
    )
    const buttons = container.querySelectorAll('.new-asset-template-button')
    if (buttons[0] instanceof HTMLElement) {
      buttons[0].click()
    }
    expect(onTemplateSelected).toHaveBeenCalledWith('humanoid')
  })

  it('shows empty message when no templates', () => {
    const container = document.createElement('div')
    render(
      <NewAssetModal
        isOpen={true}
        templates={[]}
        onTemplateSelected={() => undefined}
        onClose={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('No templates available')
  })
})
