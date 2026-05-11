import { assetInstanceId } from '../schema/ids'
import type { PartId } from '../schema/ids'
import type { AssetInstance, SlotAssignment } from '../schema/instance'
import { emptyAssignment } from '../schema/instance'
import type { Template } from '../schema/template'

const generateId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

export const createInstanceFromTemplate = (
  template: Template,
  instanceName: string,
): AssetInstance => {
  const slotEntries: ReadonlyArray<readonly [string, SlotAssignment]> = template.slots
    .reduce<ReadonlyArray<readonly [string, SlotAssignment]>>((acc, slotDef) => {
      if (slotDef.defaultPartId === undefined) return acc
      const defaultPart: PartId = slotDef.defaultPartId
      return [...acc, [slotDef.tag.value, emptyAssignment(defaultPart)]]
    }, [])

  return {
    id: assetInstanceId(generateId(template.id.value)),
    name: instanceName,
    templateId: template.id,
    slots: Object.fromEntries(slotEntries),
    version: 1,
  }
}
