import type { StoreApi } from 'zustand/vanilla'
import type { Store } from '../../store/store'
import type { FsAdapter } from '../../shell/fs/adapter'
import type { Texture } from '../../schema/texture'
import type { TextureId } from '../../schema/ids'
import { textureId } from '../../schema/ids'
import { importTexture } from '../../shell/library/import-texture'

export type AddTextureOptions = {
  readonly name: string
  readonly data: Uint8Array
  readonly width: number
  readonly height: number
  readonly libraryPath: string
  readonly store: StoreApi<Store>
  readonly adapter: FsAdapter
}

export const addTextureToLibrary = (options: AddTextureOptions): Promise<TextureId> => {
  const isReadOnly = options.libraryPath.startsWith('http://') || options.libraryPath.startsWith('https://')

  if (isReadOnly) {
    const buffer = new ArrayBuffer(options.data.byteLength)
    new Uint8Array(buffer).set(options.data)
    const blobUrl = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }))
    const sanitizedId = options.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
    const newTexture: Texture = {
      id: textureId(sanitizedId),
      name: options.name,
      file: blobUrl,
      width: options.width,
      height: options.height,
      tags: [],
    }
    const state = options.store.getState()
    options.store.getState().libraryLoaded(
      { ...state.library, textures: { ...state.library.textures, [newTexture.id.value]: newTexture } },
      options.libraryPath,
    )
    return Promise.resolve(newTexture.id)
  }

  return importTexture(
    { name: options.name, tags: [], fileName: `${options.name}.png`, data: options.data, width: options.width, height: options.height },
    options.libraryPath,
    options.adapter,
  ).then((newTexture) => {
    const state = options.store.getState()
    options.store.getState().libraryLoaded(
      { ...state.library, textures: { ...state.library.textures, [newTexture.id.value]: newTexture } },
      options.libraryPath,
    )
    return newTexture.id
  })
}
