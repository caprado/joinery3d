import type { JSX } from 'preact'
import type { Template } from '../../schema/template'
import { Modal } from '../common/modal'

export type NewAssetModalProps = {
  readonly isOpen: boolean
  readonly templates: readonly Template[]
  readonly onTemplateSelected: (templateId: string) => void
  readonly onClose: () => void
}

export const NewAssetModal = (props: NewAssetModalProps): JSX.Element | null => {
  return (
    <Modal isOpen={props.isOpen} title="New Asset" onClose={props.onClose}>
      <ul class="new-asset-template-list">
        {props.templates.map((template) => (
          <li key={template.id.value} class="new-asset-template-item">
            <button
              type="button"
              class="new-asset-template-button"
              onClick={() => {
                props.onTemplateSelected(template.id.value)
              }}
            >
              <span class="new-asset-template-name">{template.name}</span>
              <span class="new-asset-template-description">{template.description}</span>
            </button>
          </li>
        ))}
      </ul>
      {props.templates.length === 0 && (
        <p class="new-asset-empty">No templates available</p>
      )}
    </Modal>
  )
}
