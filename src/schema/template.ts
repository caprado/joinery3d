import type { TemplateId, SlotTag, PartId } from './ids'
import type { Transform } from './transform'

export type SlotDefinition = {
  readonly tag: SlotTag
  readonly name: string
  readonly anchor: Transform
  readonly defaultPartId: PartId | undefined
  readonly pairedSlot: SlotTag | undefined
  readonly required: boolean
}

export type Template = {
  readonly id: TemplateId
  readonly name: string
  readonly description: string
  readonly slots: readonly SlotDefinition[]
  readonly version: number
}

export const slotByTag = (
  template: Template,
  tag: SlotTag,
): SlotDefinition | undefined =>
  template.slots.find((slot) => slot.tag.value === tag.value)
