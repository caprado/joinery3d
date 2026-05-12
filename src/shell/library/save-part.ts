import type { FsAdapter } from '../fs/adapter'
import type { Part } from '../../schema/part'

type DiskTextureSlot = {
  readonly channel: string
  readonly defaultTextureId: string | null
}

type DiskPart = {
  readonly id: string
  readonly name: string
  readonly tags: readonly string[]
  readonly meshFile: string
  readonly defaultOffset: {
    readonly position: readonly [number, number, number]
    readonly rotation: readonly [number, number, number]
    readonly scale: number | readonly [number, number, number]
  }
  readonly textureSlots: readonly DiskTextureSlot[]
  readonly thumbnailFile: string | null
}

const toDisk = (part: Part): DiskPart => ({
  id: part.id.value,
  name: part.name,
  tags: part.tags.map((tag) => tag.value),
  meshFile: part.meshFile,
  defaultOffset: part.defaultOffset,
  textureSlots: part.textureSlots.map((slot) => ({
    channel: slot.channel,
    defaultTextureId: slot.defaultTextureId?.value ?? null,
  })),
  thumbnailFile: part.thumbnailFile ?? null,
})

export const savePartMetadata = async (
  part: Part,
  libraryPath: string,
  adapter: FsAdapter,
): Promise<void> => {
  const diskPart = toDisk(part)
  const json = JSON.stringify(diskPart, null, 2)
  const filePath = `${libraryPath}/${part.meshFile.replace('.glb', '.json')}`
  await adapter.writeTextFile(filePath, json)
}
