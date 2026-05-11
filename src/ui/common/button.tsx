import type { JSX } from 'preact'

export type ButtonProps = {
  readonly label: string
  readonly onClick: () => void
  readonly isDisabled?: boolean
  readonly variant?: 'primary' | 'secondary' | 'danger'
  readonly className?: string
}

export const Button = (props: ButtonProps): JSX.Element => {
  return (
    <button
      type="button"
      class={`button button--${props.variant ?? 'secondary'} ${props.className ?? ''}`}
      disabled={props.isDisabled ?? false}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  )
}
