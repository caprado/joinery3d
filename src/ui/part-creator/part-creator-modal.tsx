import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import type { PrimitiveType } from '../../shell/gltf/generate-primitive'
import { Modal } from '../common/modal'
import { Button } from '../common/button'

export type PartCreatorResult = {
  readonly name: string
  readonly primitiveType: PrimitiveType
  readonly width: number
  readonly height: number
  readonly depth: number
  readonly tags: readonly string[]
}

export type PartCreatorModalProps = {
  readonly isOpen: boolean
  readonly onSave: (result: PartCreatorResult) => void
  readonly onClose: () => void
}

export const PartCreatorModal = (props: PartCreatorModalProps): JSX.Element | null => {
  const [name, setName] = useState('')
  const [primitiveType, setPrimitiveType] = useState<PrimitiveType>('box')
  const [width, setWidth] = useState(0.5)
  const [height, setHeight] = useState(0.5)
  const [depth, setDepth] = useState(0.5)
  const [tagsInput, setTagsInput] = useState('')

  const handleSave = (): void => {
    const trimmedName = name.trim()
    if (trimmedName.length === 0) return
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    props.onSave({
      name: trimmedName,
      primitiveType,
      width,
      height,
      depth,
      tags,
    })
  }

  const handleNumberInput = (
    setter: (value: number) => void,
    event: Event,
  ): void => {
    const target = event.currentTarget
    if (!(target instanceof HTMLInputElement)) return
    const parsed = parseFloat(target.value)
    if (Number.isFinite(parsed) && parsed > 0) {
      setter(parsed)
    }
  }

  return (
    <Modal
      isOpen={props.isOpen}
      title="Create Part"
      onClose={props.onClose}
    >
      <div class="part-creator">
        <label class="part-creator-field">
          <span class="part-creator-label">Name</span>
          <input
            type="text"
            class="part-creator-input"
            value={name}
            placeholder="e.g. Custom Arm"
            onInput={(event) => {
              setName(event.currentTarget.value)
            }}
          />
        </label>

        <div class="part-creator-field">
          <span class="part-creator-label">Shape</span>
          <div class="part-creator-shapes">
            {(['box', 'cylinder', 'sphere', 'cone'] satisfies PrimitiveType[]).map(
              (shape) => (
                <button
                  key={shape}
                  type="button"
                  class={`part-creator-shape ${primitiveType === shape ? 'part-creator-shape--active' : ''}`}
                  onClick={() => { setPrimitiveType(shape) }}
                >
                  {shape}
                </button>
              ),
            )}
          </div>
        </div>

        <label class="part-creator-field">
          <span class="part-creator-label">Width</span>
          <input
            type="number"
            class="part-creator-input part-creator-number"
            value={width}
            step="0.05"
            min="0.01"
            onInput={(event) => { handleNumberInput(setWidth, event) }}
          />
        </label>

        <label class="part-creator-field">
          <span class="part-creator-label">Height</span>
          <input
            type="number"
            class="part-creator-input part-creator-number"
            value={height}
            step="0.05"
            min="0.01"
            onInput={(event) => { handleNumberInput(setHeight, event) }}
          />
        </label>

        {primitiveType === 'box' && (
          <label class="part-creator-field">
            <span class="part-creator-label">Depth</span>
            <input
              type="number"
              class="part-creator-input part-creator-number"
              value={depth}
              step="0.05"
              min="0.01"
              onInput={(event) => { handleNumberInput(setDepth, event) }}
            />
          </label>
        )}

        <label class="part-creator-field">
          <span class="part-creator-label">Slot Tags</span>
          <input
            type="text"
            class="part-creator-input"
            value={tagsInput}
            placeholder="head, torso, left_arm"
            onInput={(event) => {
              setTagsInput(event.currentTarget.value)
            }}
          />
        </label>

        <div class="part-creator-actions">
          <Button
            label="Create Part"
            onClick={handleSave}
            variant="primary"
            isDisabled={name.trim().length === 0}
          />
          <Button
            label="Cancel"
            onClick={props.onClose}
          />
        </div>
      </div>
    </Modal>
  )
}
