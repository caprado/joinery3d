import type { JSX } from 'preact'
import { Button } from '../common/button'
import { NewAssetButton } from './new-asset-button'
import { SaveButton } from './save-button'
import { SaveAsButton } from './save-as-button'
import { ExportButton } from './export-button'

export type TopbarProps = {
  readonly onNewAsset: () => void
  readonly onCreatePart: () => void
  readonly onOpenProject: () => void
  readonly onCloseProject: () => void
  readonly onSave: () => void
  readonly onSaveAs: () => void
  readonly onExport: () => void
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly hasInstance: boolean
  readonly isDirty: boolean
  readonly hasProjectPath: boolean
  readonly canUndo: boolean
  readonly canRedo: boolean
}

export const Topbar = (props: TopbarProps): JSX.Element => {
  const canSave = props.hasInstance && props.isDirty && props.hasProjectPath
  const canSaveAs = props.hasInstance
  const canExport = props.hasInstance

  return (
    <header class="topbar">
      <h1 class="topbar-title">Joinery3D</h1>
      <nav class="topbar-actions">
        <NewAssetButton onNewAsset={props.onNewAsset} />
        <Button
          label="Create Part"
          onClick={props.onCreatePart}
        />
        <Button
          label="Open"
          onClick={props.onOpenProject}
        />
        <SaveButton
          onSave={props.onSave}
          isDisabled={!canSave}
        />
        <SaveAsButton
          onSaveAs={props.onSaveAs}
          isDisabled={!canSaveAs}
        />
        <ExportButton
          onExport={props.onExport}
          isDisabled={!canExport}
        />
        <Button
          label="Close"
          onClick={props.onCloseProject}
          isDisabled={!props.hasInstance}
        />
      </nav>
      <div class="topbar-separator" />
      <nav class="topbar-actions">
        <Button
          label="Undo"
          onClick={props.onUndo}
          isDisabled={!props.canUndo}
        />
        <Button
          label="Redo"
          onClick={props.onRedo}
          isDisabled={!props.canRedo}
        />
      </nav>
    </header>
  )
}
