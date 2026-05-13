import type { JSX } from 'preact'
import type { SlotAssignment } from '../../schema/instance'
import type { Transform } from '../../schema/transform'
import type { ToolMode } from '../../store/state'
import { TransformControls } from './transform-controls'

export type PropertiesPanelProps = {
  readonly slotName: string | undefined
  readonly partName: string | undefined
  readonly assignment: SlotAssignment | undefined
  readonly toolMode: ToolMode
  readonly onToolModeChanged: (mode: ToolMode) => void
  readonly onOffsetChanged: (offset: Transform) => void
  readonly onResetOffset: () => void
  readonly onSaveAsPartDefault: () => void
}

export const PropertiesPanel = (props: PropertiesPanelProps): JSX.Element => {
  if (props.assignment === undefined) {
    return (
      <div class="properties-panel">
        <p class="properties-panel-empty">Select a slot to view properties</p>
      </div>
    )
  }

  return (
    <div class="properties-panel">
      <div class="properties-panel-header">
        <h3 class="properties-panel-slot-name">{props.slotName}</h3>
        <p class="properties-panel-part-name">{props.partName}</p>
      </div>
      <TransformControls
        offset={props.assignment.offset}
        toolMode={props.toolMode}
        onToolModeChanged={props.onToolModeChanged}
        onOffsetChanged={props.onOffsetChanged}
        onResetOffset={props.onResetOffset}
        onSaveAsPartDefault={props.onSaveAsPartDefault}
      />
    </div>
  )
}
