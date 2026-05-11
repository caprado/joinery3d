import type { JSX } from 'preact'
import { Button } from '../common/button'

export type ExportButtonProps = {
  readonly onExport: () => void
  readonly isDisabled: boolean
}

export const ExportButton = (props: ExportButtonProps): JSX.Element => {
  return <Button label="Export GLB" onClick={props.onExport} isDisabled={props.isDisabled} />
}
