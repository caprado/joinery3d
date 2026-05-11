import type { JSX } from 'preact'

export type LibraryPartItemProps = {
  readonly partId: string
  readonly partName: string
  readonly thumbnailFile: string | undefined
  readonly onSelect: () => void
}

export const LibraryPartItem = (props: LibraryPartItemProps): JSX.Element => {
  return (
    <li class="library-part-item">
      <button type="button" class="library-part-item-button" onClick={props.onSelect}>
        <span class="library-part-item-name">{props.partName}</span>
      </button>
    </li>
  )
}
