import type { PartId, SlotTag } from '../schema/ids'
import type { LibraryIndex } from '../schema/library'
import type { Part } from '../schema/part'
import type { Template } from '../schema/template'
import type { Texture } from '../schema/texture'

export const buildIndexFromParts = (
  templates: readonly Template[],
  parts: readonly Part[],
  textures: readonly Texture[],
): LibraryIndex => {
  const templatesRecord: Record<string, Template> = Object.fromEntries(
    templates.map((t) => [t.id.value, t]),
  )

  const partsRecord: Record<string, Part> = Object.fromEntries(
    parts.map((p) => [p.id.value, p]),
  )

  const texturesRecord: Record<string, Texture> = Object.fromEntries(
    textures.map((t) => [t.id.value, t]),
  )

  const partsByTag: Record<string, readonly PartId[]> = parts.reduce<
    Record<string, readonly PartId[]>
  >((acc, part) => {
    return part.tags.reduce<Record<string, readonly PartId[]>>((innerAcc, tag) => {
      const existing = innerAcc[tag.value] ?? []
      return { ...innerAcc, [tag.value]: [...existing, part.id] }
    }, acc)
  }, {})

  return {
    templates: templatesRecord,
    parts: partsRecord,
    textures: texturesRecord,
    partsByTag,
  }
}

export const filterPartsByTag = (
  library: LibraryIndex,
  tag: SlotTag,
): readonly Part[] => {
  const ids = library.partsByTag[tag.value] ?? []
  return ids
    .map((id) => library.parts[id.value])
    .filter((part): part is Part => part !== undefined)
}

export const searchPartsByName = (
  library: LibraryIndex,
  query: string,
): readonly Part[] => {
  const lowerQuery = query.toLowerCase()
  return Object.values(library.parts).filter((part) =>
    part.name.toLowerCase().includes(lowerQuery),
  )
}
