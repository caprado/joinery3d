import type { JSX } from 'preact'
import { NewAssetButton } from './new-asset-button'
import { SaveButton } from './save-button'
import { SaveAsButton } from './save-as-button'
import { ExportButton } from './export-button'

export type TopbarProps = {
  readonly onNewAsset: () => void
  readonly onSave: () => void
  readonly onSaveAs: () => void
  readonly onExport: () => void
  readonly hasInstance: boolean
  readonly isDirty: boolean
  readonly hasProjectPath: boolean
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
        <SaveButton onSave={props.onSave} isDisabled={!canSave} />
        <SaveAsButton onSaveAs={props.onSaveAs} isDisabled={!canSaveAs} />
        <ExportButton onExport={props.onExport} isDisabled={!canExport} />
      </nav>
    </header>
  )
}
