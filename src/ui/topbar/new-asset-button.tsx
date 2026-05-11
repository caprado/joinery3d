import type { JSX } from 'preact'
import { Button } from '../common/button'

export type NewAssetButtonProps = {
  readonly onNewAsset: () => void
}

export const NewAssetButton = (props: NewAssetButtonProps): JSX.Element => {
  return <Button label="New Asset" onClick={props.onNewAsset} variant="primary" />
}
