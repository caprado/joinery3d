import type { PartId, SlotTag, TextureId } from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import { emptyAssignment } from '../schema/instance'
import type { TextureChannel } from '../schema/part'
import type { Template } from '../schema/template'
import type { Transform } from '../schema/transform'
import { IDENTITY_TRANSFORM } from '../schema/transform'

export const setSlotPart = (
  instance: AssetInstance,
  slotTagValue: SlotTag,
  newPartId: PartId,
): AssetInstance => {
  const key = slotTagValue.value
  return {
    ...instance,
    slots: {
      ...instance.slots,
      [key]: emptyAssignment(newPartId),
    },
  }
}

export const setSlotOffset = (
  instance: AssetInstance,
  slotTagValue: SlotTag,
  offset: Transform,
): AssetInstance => {
  const key = slotTagValue.value
  const existing = instance.slots[key]
  if (existing === undefined) return instance
  return {
    ...instance,
    slots: {
      ...instance.slots,
      [key]: { ...existing, offset },
    },
  }
}

export const resetSlotOffset = (
  instance: AssetInstance,
  slotTagValue: SlotTag,
): AssetInstance => {
  const key = slotTagValue.value
  const existing = instance.slots[key]
  if (existing === undefined) return instance
  return {
    ...instance,
    slots: {
      ...instance.slots,
      [key]: { ...existing, offset: IDENTITY_TRANSFORM },
    },
  }
}

export const setSlotTexture = (
  instance: AssetInstance,
  slotTagValue: SlotTag,
  channel: TextureChannel,
  newTextureId: TextureId | undefined,
): AssetInstance => {
  const key = slotTagValue.value
  const existing = instance.slots[key]
  if (existing === undefined) return instance

  if (newTextureId === undefined) {
    const rest = Object.fromEntries(
      Object.entries(existing.textures).filter(([k]) => k !== channel),
    )
    return {
      ...instance,
      slots: {
        ...instance.slots,
        [key]: { ...existing, textures: rest },
      },
    }
  }

  return {
    ...instance,
    slots: {
      ...instance.slots,
      [key]: {
        ...existing,
        textures: { ...existing.textures, [channel]: newTextureId },
      },
    },
  }
}

export const resolvePairedSlot = (
  template: Template,
  slotTagValue: SlotTag,
): SlotTag | undefined => {
  const slot = template.slots.find((s) => s.tag.value === slotTagValue.value)
  return slot?.pairedSlot
}
