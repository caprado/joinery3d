import type { JSX } from 'preact'
import type { SlotDefinition } from '../../schema/template'
import type { SlotAssignment } from '../../schema/instance'
import type { Part } from '../../schema/part'
import { SlotListItem } from './slot-list-item'

export type SlotListProps = {
  readonly slots: readonly SlotDefinition[]
  readonly assignments: Readonly<Partial<Record<string, SlotAssignment>>>
  readonly parts: Readonly<Record<string, Part>>
  readonly selectedSlotTag: string | undefined
  readonly onSlotSelected: (slotTag: string) => void
}

export const SlotList = (props: SlotListProps): JSX.Element => {
  return (
    <ul class="slot-list">
      {props.slots.map((slot) => {
        const assignment = props.assignments[slot.tag.value]
        const part = assignment !== undefined ? props.parts[assignment.partId.value] : undefined

        return (
          <SlotListItem
            key={slot.tag.value}
            slotTag={slot.tag.value}
            slotName={slot.name}
            partName={part?.name}
            isSelected={props.selectedSlotTag === slot.tag.value}
            onSelect={() => {
              props.onSlotSelected(slot.tag.value)
            }}
          />
        )
      })}
    </ul>
  )
}
