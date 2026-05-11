import type { JSX } from 'preact'
import { Button } from '../common/button'

export type SaveButtonProps = {
  readonly onSave: () => void
  readonly isDisabled: boolean
}

export const SaveButton = (props: SaveButtonProps): JSX.Element => {
  return <Button label="Save" onClick={props.onSave} isDisabled={props.isDisabled} />
}
