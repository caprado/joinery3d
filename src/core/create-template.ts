import { templateId, slotTag } from '../schema/ids'
import type { Template, SlotDefinition } from '../schema/template'
import type { Transform } from '../schema/transform'

export type SlotInput = {
  readonly name: string
  readonly tag: string
  readonly anchorPosition: readonly [number, number, number]
}

export const createTemplateFromSlots = (
  templateName: string,
  description: string,
  slotInputs: readonly SlotInput[],
): Template => {
  const slots: readonly SlotDefinition[] = slotInputs.map((input) => ({
    tag: slotTag(input.tag),
    name: input.name,
    anchor: {
      position: input.anchorPosition,
      rotation: [0, 0, 0],
      scale: 1,
    } satisfies Transform,
    defaultPartId: undefined,
    pairedSlot: undefined,
    required: true,
  }))

  return {
    id: templateId(templateName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()),
    name: templateName,
    description,
    slots,
    version: 1,
  }
}
