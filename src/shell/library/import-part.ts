import type { FsAdapter } from '../fs/adapter'
import type { SlotTag } from '../../schema/ids'
import { partId, slotTag } from '../../schema/ids'
import type { Part } from '../../schema/part'
import type { Transform } from '../../schema/transform'

export type ImportPartOptions = {
  readonly name: string
  readonly tags: readonly string[]
  readonly defaultOffset: Transform
  readonly fileName: string
  readonly data: Uint8Array
}

const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()

export const importPart = async (
  options: ImportPartOptions,
  libraryPath: string,
  adapter: FsAdapter,
): Promise<Part> => {
  const sanitizedId = sanitizeFileName(options.name)
  const primaryTag = options.tags[0] ?? 'parts'
  const glbPath = `parts/${primaryTag}/${sanitizedId}.glb`
  const jsonPath = `parts/${primaryTag}/${sanitizedId}.json`

  await adapter.writeBinaryFile(`${libraryPath}/${glbPath}`, options.data)

  const tags: readonly SlotTag[] = options.tags.map((tag) => slotTag(tag))

  const part: Part = {
    id: partId(sanitizedId),
    name: options.name,
    tags,
    meshFile: glbPath,
    defaultOffset: options.defaultOffset,
    textureSlots: [],
    thumbnailFile: undefined,
  }

  const diskPart = {
    id: sanitizedId,
    name: options.name,
    tags: options.tags,
    meshFile: glbPath,
    defaultOffset: options.defaultOffset,
    textureSlots: [],
    thumbnailFile: null,
  }

  await adapter.writeTextFile(
    `${libraryPath}/${jsonPath}`,
    JSON.stringify(diskPart, null, 2),
  )

  return part
}
