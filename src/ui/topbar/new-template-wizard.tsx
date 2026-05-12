import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import { Modal } from '../common/modal'
import { Button } from '../common/button'
import type { MeshInfo } from '../../shell/gltf/inspect'

export type SlotConfig = {
  readonly meshName: string
  readonly slotName: string
  readonly slotTag: string
  readonly anchorPosition: readonly [number, number, number]
  readonly isIncluded: boolean
}

export type NewTemplateWizardProps = {
  readonly isOpen: boolean
  readonly meshes: readonly MeshInfo[]
  readonly onSave: (
    templateName: string,
    description: string,
    slots: readonly SlotConfig[],
  ) => void
  readonly onClose: () => void
}

export const NewTemplateWizard = (props: NewTemplateWizardProps): JSX.Element | null => {
  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [slotConfigs, setSlotConfigs] = useState<readonly SlotConfig[]>(
    props.meshes.map((mesh) => ({
      meshName: mesh.name,
      slotName: mesh.name,
      slotTag: mesh.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      anchorPosition: mesh.position,
      isIncluded: true,
    })),
  )

  const handleSlotChange = (index: number, field: string, value: string | boolean): void => {
    setSlotConfigs(
      slotConfigs.map((config, i) =>
        i === index ? { ...config, [field]: value } : config,
      ),
    )
  }

  const handleSave = (): void => {
    if (templateName.trim().length === 0) return
    const includedSlots = slotConfigs.filter((config) => config.isIncluded)
    props.onSave(templateName.trim(), description.trim(), includedSlots)
  }

  return (
    <Modal isOpen={props.isOpen} title="New Template" onClose={props.onClose}>
      <div class="new-template-wizard">
        <label class="new-template-field">
          <span class="new-template-label">Template Name</span>
          <input
            type="text"
            class="new-template-input new-template-name-input"
            value={templateName}
            onInput={(event) => {
              setTemplateName(event.currentTarget.value)
            }}
          />
        </label>
        <label class="new-template-field">
          <span class="new-template-label">Description</span>
          <input
            type="text"
            class="new-template-input new-template-description-input"
            value={description}
            onInput={(event) => {
              setDescription(event.currentTarget.value)
            }}
          />
        </label>

        <h4 class="new-template-slots-title">Meshes → Slots</h4>
        <ul class="new-template-slots-list">
          {slotConfigs.map((config, index) => (
            <li key={config.meshName} class="new-template-slot-item">
              <label class="new-template-slot-include">
                <input
                  type="checkbox"
                  checked={config.isIncluded}
                  onChange={(event) => {
                    handleSlotChange(index, 'isIncluded', event.currentTarget.checked)
                  }}
                />
                <span>{config.meshName}</span>
              </label>
              {config.isIncluded && (
                <div class="new-template-slot-config">
                  <input
                    type="text"
                    class="new-template-slot-name-input"
                    placeholder="Slot name"
                    value={config.slotName}
                    onInput={(event) => {
                      handleSlotChange(index, 'slotName', event.currentTarget.value)
                    }}
                  />
                  <input
                    type="text"
                    class="new-template-slot-tag-input"
                    placeholder="Slot tag"
                    value={config.slotTag}
                    onInput={(event) => {
                      handleSlotChange(index, 'slotTag', event.currentTarget.value)
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>

        {props.meshes.length === 0 && (
          <p class="new-template-empty">No meshes found in the GLB</p>
        )}

        <div class="new-template-actions">
          <Button label="Save Template" onClick={handleSave} variant="primary" />
          <Button label="Cancel" onClick={props.onClose} />
        </div>
      </div>
    </Modal>
  )
}
