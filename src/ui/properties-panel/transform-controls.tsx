import type { JSX } from 'preact'
import type { Transform } from '../../schema/transform'
import type { Vec3 } from '../../schema/vec'
import type { ToolMode } from '../../store/state'
import { TransformAxisInput } from './transform-axis-input'
import { Button } from '../common/button'

export type TransformControlsProps = {
  readonly offset: Transform
  readonly toolMode: ToolMode
  readonly onToolModeChanged: (mode: ToolMode) => void
  readonly onOffsetChanged: (offset: Transform) => void
  readonly onResetOffset: () => void
  readonly onSaveAsPartDefault: () => void
}

const resolveScale = (scale: Vec3 | number): Vec3 =>
  typeof scale === 'number' ? [scale, scale, scale] : scale

const updateVec3 = (vec: Vec3, index: 0 | 1 | 2, value: number): Vec3 => [
  index === 0 ? value : vec[0],
  index === 1 ? value : vec[1],
  index === 2 ? value : vec[2],
]

export const TransformControls = (props: TransformControlsProps): JSX.Element => {
  const scaleVec = resolveScale(props.offset.scale)

  const handlePositionChanged = (index: 0 | 1 | 2, value: number): void => {
    props.onOffsetChanged({
      ...props.offset,
      position: updateVec3(props.offset.position, index, value),
    })
  }

  const handleRotationChanged = (index: 0 | 1 | 2, value: number): void => {
    props.onOffsetChanged({
      ...props.offset,
      rotation: updateVec3(props.offset.rotation, index, value),
    })
  }

  const handleScaleChanged = (index: 0 | 1 | 2, value: number): void => {
    props.onOffsetChanged({
      ...props.offset,
      scale: updateVec3(scaleVec, index, value),
    })
  }

  return (
    <div class="transform-controls">
      <div class="transform-controls-modes">
        <button
          type="button"
          class={`tool-button ${props.toolMode === 'translate' ? 'tool-button--active' : ''}`}
          onClick={() => { props.onToolModeChanged('translate') }}
        >
          Translate
        </button>
        <button
          type="button"
          class={`tool-button ${props.toolMode === 'rotate' ? 'tool-button--active' : ''}`}
          onClick={() => { props.onToolModeChanged('rotate') }}
        >
          Rotate
        </button>
        <button
          type="button"
          class={`tool-button ${props.toolMode === 'scale' ? 'tool-button--active' : ''}`}
          onClick={() => { props.onToolModeChanged('scale') }}
        >
          Scale
        </button>
      </div>

      <fieldset class="transform-controls-group">
        <legend>Position</legend>
        <TransformAxisInput axisLabel="X" axisValue={props.offset.position[0]} onAxisValueChanged={(v) => { handlePositionChanged(0, v) }} />
        <TransformAxisInput axisLabel="Y" axisValue={props.offset.position[1]} onAxisValueChanged={(v) => { handlePositionChanged(1, v) }} />
        <TransformAxisInput axisLabel="Z" axisValue={props.offset.position[2]} onAxisValueChanged={(v) => { handlePositionChanged(2, v) }} />
      </fieldset>

      <fieldset class="transform-controls-group">
        <legend>Rotation</legend>
        <TransformAxisInput axisLabel="X" axisValue={props.offset.rotation[0]} onAxisValueChanged={(v) => { handleRotationChanged(0, v) }} />
        <TransformAxisInput axisLabel="Y" axisValue={props.offset.rotation[1]} onAxisValueChanged={(v) => { handleRotationChanged(1, v) }} />
        <TransformAxisInput axisLabel="Z" axisValue={props.offset.rotation[2]} onAxisValueChanged={(v) => { handleRotationChanged(2, v) }} />
      </fieldset>

      <fieldset class="transform-controls-group">
        <legend>Scale</legend>
        <TransformAxisInput axisLabel="X" axisValue={scaleVec[0]} onAxisValueChanged={(v) => { handleScaleChanged(0, v) }} />
        <TransformAxisInput axisLabel="Y" axisValue={scaleVec[1]} onAxisValueChanged={(v) => { handleScaleChanged(1, v) }} />
        <TransformAxisInput axisLabel="Z" axisValue={scaleVec[2]} onAxisValueChanged={(v) => { handleScaleChanged(2, v) }} />
      </fieldset>

      <div class="transform-controls-actions">
        <Button label="Reset" onClick={props.onResetOffset} />
        <Button label="Save as Part Default" onClick={props.onSaveAsPartDefault} />
      </div>
    </div>
  )
}
