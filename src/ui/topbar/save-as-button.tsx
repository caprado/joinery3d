import type { JSX } from 'preact'
import { Button } from '../common/button'

export type SaveAsButtonProps = {
  readonly onSaveAs: () => void
  readonly isDisabled: boolean
}

export const SaveAsButton = (props: SaveAsButtonProps): JSX.Element => {
  return <Button label="Save As" onClick={props.onSaveAs} isDisabled={props.isDisabled} />
}
