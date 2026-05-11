import type { PartId, SlotTag, TemplateId, TextureId } from './ids'
import type { Part } from './part'
import type { Template } from './template'
import type { Texture } from './texture'

export type LibraryIndex = {
  readonly templates: Readonly<Record<string, Template>>
  readonly parts: Readonly<Record<string, Part>>
  readonly textures: Readonly<Record<string, Texture>>
  readonly partsByTag: Readonly<Record<string, readonly PartId[]>>
}

export const emptyLibrary: LibraryIndex = {
  templates: {},
  parts: {},
  textures: {},
  partsByTag: {},
}

export const findTemplate = (
  library: LibraryIndex,
  id: TemplateId,
): Template | undefined => library.templates[id.value]

export const findPart = (
  library: LibraryIndex,
  id: PartId,
): Part | undefined => library.parts[id.value]

export const findTexture = (
  library: LibraryIndex,
  id: TextureId,
): Texture | undefined => library.textures[id.value]

export const partsForTag = (
  library: LibraryIndex,
  tag: SlotTag,
): readonly PartId[] => library.partsByTag[tag.value] ?? []
