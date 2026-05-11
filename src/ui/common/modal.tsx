import type { ComponentChildren, JSX } from 'preact'

export type ModalProps = {
  readonly isOpen: boolean
  readonly title: string
  readonly onClose: () => void
  readonly children: ComponentChildren
}

export const Modal = (props: ModalProps): JSX.Element | null => {
  if (!props.isOpen) return null

  return (
    <div class="modal-overlay" onClick={props.onClose}>
      <div
        class="modal-content"
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <header class="modal-header">
          <h2 class="modal-title">{props.title}</h2>
          <button type="button" class="modal-close" onClick={props.onClose}>
            &times;
          </button>
        </header>
        <div class="modal-body">{props.children}</div>
      </div>
    </div>
  )
}
