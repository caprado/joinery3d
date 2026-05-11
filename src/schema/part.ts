import type { PartId, SlotTag, TextureId } from './ids'
import type { Transform } from './transform'

export type TextureChannel = 'diffuse' | 'normal' | 'specular' | 'emissive'

export type TextureSlot = {
  readonly channel: TextureChannel
  readonly defaultTextureId: TextureId | undefined
}

export type Part = {
  readonly id: PartId
  readonly name: string
  readonly tags: readonly SlotTag[]
  readonly meshFile: string
  readonly defaultOffset: Transform
  readonly textureSlots: readonly TextureSlot[]
  readonly thumbnailFile: string | undefined
}

export const partAcceptsTag = (part: Part, tag: SlotTag): boolean =>
  part.tags.some((partTag) => partTag.value === tag.value)
