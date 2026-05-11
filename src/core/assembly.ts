import type { PartId, SlotTag } from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { LibraryIndex } from '../schema/library'
import { findPart } from '../schema/library'
import type { TextureChannel } from '../schema/part'
import type { Template } from '../schema/template'
import type { Transform } from '../schema/transform'
import { composeTransform } from '../schema/transform'

export type RenderNode = {
  readonly slotTag: SlotTag
  readonly partId: PartId
  readonly meshFile: string
  readonly worldTransform: Transform
  readonly textures: Readonly<Partial<Record<TextureChannel, string>>>
}

export type RenderDescription = {
  readonly nodes: readonly RenderNode[]
}

const resolveTexturePaths = (
  assignment: { readonly textures: Readonly<Partial<Record<string, { readonly value: string }>>> },
  library: LibraryIndex,
): Partial<Record<TextureChannel, string>> =>
  Object.fromEntries(
    Object.entries(assignment.textures)
      .filter((entry): entry is [string, { readonly value: string }] => entry[1] !== undefined)
      .map(([channel, texId]) => {
        const texture = library.textures[texId.value]
        return texture !== undefined ? [channel, texture.file] : undefined
      })
      .filter((entry): entry is [string, string] => entry !== undefined),
  )

export const buildRenderDescription = (
  instance: AssetInstance,
  template: Template,
  library: LibraryIndex,
): RenderDescription => {
  const nodes: RenderNode[] = template.slots
    .map((slotDef) => {
      const assignment = instance.slots[slotDef.tag.value]
      if (assignment === undefined) return undefined

      const part = findPart(library, assignment.partId)
      if (part === undefined) return undefined

      const worldTransform = composeTransform(
        composeTransform(slotDef.anchor, part.defaultOffset),
        assignment.offset,
      )

      const textures = resolveTexturePaths(assignment, library)

      return {
        slotTag: slotDef.tag,
        partId: assignment.partId,
        meshFile: part.meshFile,
        worldTransform,
        textures,
      }
    })
    .filter((node): node is RenderNode => node !== undefined)

  return { nodes }
}
