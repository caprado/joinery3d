import type { JSX } from 'preact'
import { useState } from 'preact/hooks'

export type EditableTextProps = {
  readonly value: string
  readonly onCommit: (newValue: string) => void
  readonly className?: string
}

export const EditableText = (props: EditableTextProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(props.value)

  const handleDoubleClick = (): void => {
    setEditValue(props.value)
    setIsEditing(true)
  }

  const handleCommit = (): void => {
    const trimmed = editValue.trim()
    if (trimmed.length > 0 && trimmed !== props.value) {
      props.onCommit(trimmed)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter') {
      handleCommit()
    }
    if (event.key === 'Escape') {
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        type="text"
        class={`editable-text-input ${props.className ?? ''}`}
        value={editValue}
        onInput={(event) => {
          setEditValue(event.currentTarget.value)
        }}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    )
  }

  return (
    <span
      class={`editable-text ${props.className ?? ''}`}
      onDblClick={handleDoubleClick}
      title="Double-click to edit"
    >
      {props.value}
    </span>
  )
}
