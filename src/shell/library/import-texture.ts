import type { FsAdapter } from '../fs/adapter'
import { textureId } from '../../schema/ids'
import type { Texture } from '../../schema/texture'

export type ImportTextureOptions = {
  readonly name: string
  readonly tags: readonly string[]
  readonly fileName: string
  readonly data: Uint8Array
  readonly width: number
  readonly height: number
}

const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()

export const importTexture = async (
  options: ImportTextureOptions,
  libraryPath: string,
  adapter: FsAdapter,
): Promise<Texture> => {
  const sanitizedId = sanitizeFileName(options.name)
  const pngPath = `textures/${sanitizedId}.png`
  const jsonPath = `textures/${sanitizedId}.json`

  await adapter.writeBinaryFile(`${libraryPath}/${pngPath}`, options.data)

  const texture: Texture = {
    id: textureId(sanitizedId),
    name: options.name,
    file: pngPath,
    width: options.width,
    height: options.height,
    tags: options.tags,
  }

  const diskTexture = {
    id: sanitizedId,
    name: options.name,
    file: pngPath,
    width: options.width,
    height: options.height,
    tags: options.tags,
  }

  await adapter.writeTextFile(
    `${libraryPath}/${jsonPath}`,
    JSON.stringify(diskTexture, null, 2),
  )

  return texture
}
