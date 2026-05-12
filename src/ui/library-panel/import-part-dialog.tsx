import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import { Modal } from '../common/modal'
import { Button } from '../common/button'

export type ImportPartDialogProps = {
  readonly isOpen: boolean
  readonly fileName: string
  readonly onConfirm: (name: string, tags: readonly string[]) => void
  readonly onClose: () => void
}

export const ImportPartDialog = (props: ImportPartDialogProps): JSX.Element | null => {
  const [partName, setPartName] = useState(props.fileName.replace('.glb', ''))
  const [tagsInput, setTagsInput] = useState('')

  const handleConfirm = (): void => {
    const trimmedName = partName.trim()
    if (trimmedName.length === 0) return
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    props.onConfirm(trimmedName, tags)
  }

  return (
    <Modal isOpen={props.isOpen} title="Import Part" onClose={props.onClose}>
      <div class="import-part-dialog">
        <label class="import-part-field">
          <span class="import-part-label">Part Name</span>
          <input
            type="text"
            class="import-part-input"
            value={partName}
            onInput={(event) => {
              setPartName(event.currentTarget.value)
            }}
          />
        </label>
        <label class="import-part-field">
          <span class="import-part-label">Slot Tags (comma-separated)</span>
          <input
            type="text"
            class="import-part-input import-part-tags-input"
            placeholder="head, torso, left_arm"
            value={tagsInput}
            onInput={(event) => {
              setTagsInput(event.currentTarget.value)
            }}
          />
        </label>
        <p class="import-part-file">File: {props.fileName}</p>
        <div class="import-part-actions">
          <Button label="Import" onClick={handleConfirm} variant="primary" />
          <Button label="Cancel" onClick={props.onClose} />
        </div>
      </div>
    </Modal>
  )
}
