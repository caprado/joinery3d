import type { JSX } from 'preact'
import type { Transform } from '../../schema/transform'
import type { ToolMode } from '../../store/state'
import { TransformControls } from '../properties-panel/transform-controls'

export type PartOffsetEditorProps = {
  readonly partName: string
  readonly defaultOffset: Transform
  readonly toolMode: ToolMode
  readonly onToolModeChanged: (mode: ToolMode) => void
  readonly onOffsetChanged: (offset: Transform) => void
  readonly onSave: () => void
  readonly onClose: () => void
}

export const PartOffsetEditor = (props: PartOffsetEditorProps): JSX.Element => {
  return (
    <div class="part-offset-editor">
      <div class="part-offset-editor-header">
        <h3 class="part-offset-editor-title">Edit Default Offset</h3>
        <p class="part-offset-editor-part-name">{props.partName}</p>
      </div>
      <TransformControls
        offset={props.defaultOffset}
        toolMode={props.toolMode}
        onToolModeChanged={props.onToolModeChanged}
        onOffsetChanged={props.onOffsetChanged}
        onResetOffset={() => {
          props.onOffsetChanged({
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
          })
        }}
        onSaveAsPartDefault={props.onSave}
      />
      <div class="part-offset-editor-actions">
        <button type="button" class="part-offset-editor-close" onClick={props.onClose}>
          Done
        </button>
      </div>
    </div>
  )
}
