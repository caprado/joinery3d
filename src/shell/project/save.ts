import type { FsAdapter } from '../fs/adapter'
import type { AssetInstance } from '../../schema/instance'
import type { TextureChannel } from '../../schema/part'

type DiskSlotAssignment = {
  readonly partId: string
  readonly offset: {
    readonly position: readonly [number, number, number]
    readonly rotation: readonly [number, number, number]
    readonly scale: number | readonly [number, number, number]
  }
  readonly textures: Partial<Record<TextureChannel, string>>
}

type DiskAssetInstance = {
  readonly id: string
  readonly name: string
  readonly templateId: string
  readonly version: number
  readonly slots: Record<string, DiskSlotAssignment>
}

const toDisk = (instance: AssetInstance): DiskAssetInstance => ({
  id: instance.id.value,
  name: instance.name,
  templateId: instance.templateId.value,
  version: instance.version,
  slots: Object.fromEntries(
    Object.entries(instance.slots)
      .filter((entry): entry is [string, NonNullable<typeof entry[1]>] => entry[1] !== undefined)
      .map(([key, assignment]) => [
        key,
        {
          partId: assignment.partId.value,
          offset: assignment.offset,
          textures: Object.fromEntries(
            Object.entries(assignment.textures).map(([channel, texId]) => [channel, texId.value]),
          ),
        },
      ]),
  ),
})

export const saveProject = async (
  instance: AssetInstance,
  path: string,
  adapter: FsAdapter,
): Promise<void> => {
  const disk = toDisk(instance)
  const json = JSON.stringify(disk, null, 2)
  await adapter.writeTextFile(path, json)
}
