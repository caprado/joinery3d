import type { FsAdapter } from '../fs/adapter'
import type { Template } from '../../schema/template'

type DiskSlotDefinition = {
  readonly tag: string
  readonly name: string
  readonly anchor: {
    readonly position: readonly [number, number, number]
    readonly rotation: readonly [number, number, number]
    readonly scale: number | readonly [number, number, number]
  }
  readonly defaultPartId: string | null
  readonly pairedSlot: string | null
  readonly required: boolean
}

type DiskTemplate = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly version: number
  readonly slots: readonly DiskSlotDefinition[]
}

const toDisk = (template: Template): DiskTemplate => ({
  id: template.id.value,
  name: template.name,
  description: template.description,
  version: template.version,
  slots: template.slots.map((slot) => ({
    tag: slot.tag.value,
    name: slot.name,
    anchor: slot.anchor,
    defaultPartId: slot.defaultPartId?.value ?? null,
    pairedSlot: slot.pairedSlot?.value ?? null,
    required: slot.required,
  })),
})

export const saveTemplate = async (
  template: Template,
  libraryPath: string,
  adapter: FsAdapter,
): Promise<void> => {
  const disk = toDisk(template)
  const json = JSON.stringify(disk, null, 2)
  const filePath = `${libraryPath}/templates/${template.id.value}.template.json`
  await adapter.writeTextFile(filePath, json)
}
