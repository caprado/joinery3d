import type { JSX } from 'preact'

export type IconName =
  | 'translate'
  | 'rotate'
  | 'scale'
  | 'reset'
  | 'save'
  | 'export'
  | 'add'
  | 'close'
  | 'mirror'
  | 'snap'

export type IconProps = {
  readonly name: IconName
  readonly size?: number
  readonly className?: string
}

export const Icon = (props: IconProps): JSX.Element => {
  const size = props.size ?? 16
  return (
    <span
      class={`icon icon--${props.name} ${props.className ?? ''}`}
      style={{ width: `${String(size)}px`, height: `${String(size)}px`, display: 'inline-block' }}
      aria-hidden="true"
    />
  )
}
