import type { AssetInstanceId, PartId, TemplateId, TextureId } from './ids'
import type { TextureChannel } from './part'
import type { Transform } from './transform'
import { IDENTITY_TRANSFORM } from './transform'

export type SlotAssignment = {
  readonly partId: PartId
  readonly offset: Transform
  readonly textures: Readonly<Partial<Record<TextureChannel, TextureId>>>
}

export type AssetInstance = {
  readonly id: AssetInstanceId
  readonly name: string
  readonly templateId: TemplateId
  readonly slots: Readonly<Partial<Record<string, SlotAssignment>>>
  readonly version: number
}

export const emptyAssignment = (assignedPartId: PartId): SlotAssignment => ({
  partId: assignedPartId,
  offset: IDENTITY_TRANSFORM,
  textures: {},
})
