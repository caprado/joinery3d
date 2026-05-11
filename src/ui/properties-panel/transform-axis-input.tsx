import type { JSX } from 'preact'

export type TransformAxisInputProps = {
  readonly axisLabel: string
  readonly axisValue: number
  readonly onAxisValueChanged: (value: number) => void
}

export const TransformAxisInput = (props: TransformAxisInputProps): JSX.Element => {
  const handleInput = (event: Event): void => {
    const target = event.currentTarget
    if (!(target instanceof HTMLInputElement)) return
    const parsed = parseFloat(target.value)
    if (Number.isFinite(parsed)) {
      props.onAxisValueChanged(parsed)
    }
  }

  return (
    <label class="transform-axis-input">
      <span class="transform-axis-input-label">{props.axisLabel}</span>
      <input
        type="number"
        class="transform-axis-input-field"
        value={props.axisValue.toFixed(3)}
        step="0.01"
        onInput={handleInput}
      />
    </label>
  )
}
