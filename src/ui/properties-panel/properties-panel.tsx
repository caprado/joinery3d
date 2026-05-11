import type { JSX } from 'preact'
import type { SlotAssignment } from '../../schema/instance'
import type { Transform } from '../../schema/transform'
import type { ToolMode } from '../../store/state'
import type { TextureAssignment } from './texture-section'
import { TextureSection } from './texture-section'
import { Button } from '../common/button'

export type PropertiesPanelProps = {
  readonly slotName: string | undefined
  readonly partName: string | undefined
  readonly assignment: SlotAssignment | undefined
  readonly toolMode: ToolMode
  readonly textureAssignments: readonly TextureAssignment[]
  readonly onToolModeChanged: (mode: ToolMode) => void
  readonly onOffsetChanged: (offset: Transform) => void
  readonly onResetOffset: () => void
  readonly onSaveAsPartDefault: () => void
}

export const PropertiesPanel = (props: PropertiesPanelProps): JSX.Element => {
  if (props.assignment === undefined) {
    return (
      <aside class="properties-panel">
        <p class="properties-panel-empty">Select a slot to view properties</p>
      </aside>
    )
  }

  const offset = props.assignment.offset

  return (
    <aside class="properties-panel">
      <div class="properties-panel-header">
        <h3 class="properties-panel-slot-name">{props.slotName}</h3>
        <p class="properties-panel-part-name">{props.partName}</p>
      </div>

      <div class="properties-panel-tools">
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

      <div class="properties-panel-offset">
        <h4>Position</h4>
        <div class="properties-panel-values">
          <span>X: {offset.position[0].toFixed(3)}</span>
          <span>Y: {offset.position[1].toFixed(3)}</span>
          <span>Z: {offset.position[2].toFixed(3)}</span>
        </div>
        <h4>Rotation</h4>
        <div class="properties-panel-values">
          <span>X: {offset.rotation[0].toFixed(3)}</span>
          <span>Y: {offset.rotation[1].toFixed(3)}</span>
          <span>Z: {offset.rotation[2].toFixed(3)}</span>
        </div>
        <h4>Scale</h4>
        <div class="properties-panel-values">
          {typeof offset.scale === 'number' ? (
            <span>Uniform: {offset.scale.toFixed(3)}</span>
          ) : (
            <>
              <span>X: {offset.scale[0].toFixed(3)}</span>
              <span>Y: {offset.scale[1].toFixed(3)}</span>
              <span>Z: {offset.scale[2].toFixed(3)}</span>
            </>
          )}
        </div>
      </div>

      <div class="properties-panel-actions">
        <Button label="Reset" onClick={props.onResetOffset} />
        <Button label="Save as Part Default" onClick={props.onSaveAsPartDefault} />
      </div>

      <TextureSection assignments={props.textureAssignments} />
    </aside>
  )
}
