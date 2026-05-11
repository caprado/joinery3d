import type { JSX } from 'preact'

export type SlotListItemProps = {
  readonly slotTag: string
  readonly slotName: string
  readonly partName: string | undefined
  readonly isSelected: boolean
  readonly onSelect: () => void
}

export const SlotListItem = (props: SlotListItemProps): JSX.Element => {
  return (
    <li class={`slot-list-item ${props.isSelected ? 'slot-list-item--selected' : ''}`}>
      <button type="button" class="slot-list-item-button" onClick={props.onSelect}>
        <span class="slot-list-item-name">{props.slotName}</span>
        <span class="slot-list-item-part">
          {props.partName ?? 'Empty'}
        </span>
      </button>
    </li>
  )
}
