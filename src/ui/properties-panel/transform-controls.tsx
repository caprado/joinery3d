import type { JSX } from 'preact'
import type { Transform } from '../../schema/transform'
import { resolveScale, setVec3Component } from '../../schema/vec'
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

export const TransformControls = (props: TransformControlsProps): JSX.Element => {
  const scaleVec = resolveScale(props.offset.scale)

  const handlePositionChanged = (index: 0 | 1 | 2, value: number): void => {
    props.onOffsetChanged({
      ...props.offset,
      position: setVec3Component(props.offset.position, index, value),
    })
  }

  const handleRotationChanged = (index: 0 | 1 | 2, value: number): void => {
    props.onOffsetChanged({
      ...props.offset,
      rotation: setVec3Component(props.offset.rotation, index, value),
    })
  }

  const handleScaleChanged = (index: 0 | 1 | 2, value: number): void => {
    props.onOffsetChanged({
      ...props.offset,
      scale: setVec3Component(scaleVec, index, value),
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
        <TransformAxisInput 
          axisLabel="X" 
          axisValue={props.offset.position[0]} 
          onAxisValueChanged={(value) => { handlePositionChanged(0, value) }}
        />
        <TransformAxisInput 
          axisLabel="Y" 
          axisValue={props.offset.position[1]} 
          onAxisValueChanged={(value) => { handlePositionChanged(1, value) }}
        />
        <TransformAxisInput 
          axisLabel="Z" 
          axisValue={props.offset.position[2]} 
          onAxisValueChanged={(value) => { handlePositionChanged(2, value) }}
        />
      </fieldset>

      <fieldset class="transform-controls-group">
        <legend>Rotation</legend>
        <TransformAxisInput 
          axisLabel="X" 
          axisValue={props.offset.rotation[0]} 
          onAxisValueChanged={(value) => { handleRotationChanged(0, value) }}
        />
        <TransformAxisInput 
          axisLabel="Y" 
          axisValue={props.offset.rotation[1]} 
          onAxisValueChanged={(value) => { handleRotationChanged(1, value) }}
        />
        <TransformAxisInput 
          axisLabel="Z" 
          axisValue={props.offset.rotation[2]} 
          onAxisValueChanged={(value) => { handleRotationChanged(2, value) }}
        />
      </fieldset>

      <fieldset class="transform-controls-group">
        <legend>Scale</legend>
        <TransformAxisInput 
          axisLabel="X" 
          axisValue={scaleVec[0]} 
          onAxisValueChanged={(value) => { handleScaleChanged(0, value) }}
        />
        <TransformAxisInput 
          axisLabel="Y" 
          axisValue={scaleVec[1]} 
          onAxisValueChanged={(value) => { handleScaleChanged(1, value) }}
        />
        <TransformAxisInput 
          axisLabel="Z" 
          axisValue={scaleVec[2]} 
          onAxisValueChanged={(value) => { handleScaleChanged(2, value) }}
        />
      </fieldset>

      <div class="transform-controls-actions">
        <Button label="Reset" onClick={props.onResetOffset} />
        <Button label="Save as Part Default" onClick={props.onSaveAsPartDefault} />
      </div>
    </div>
  )
}
