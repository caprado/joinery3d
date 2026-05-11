export type PartId = { readonly kind: 'PartId'; readonly value: string }
export type SlotTag = { readonly kind: 'SlotTag'; readonly value: string }
export type TextureId = { readonly kind: 'TextureId'; readonly value: string }
export type TemplateId = { readonly kind: 'TemplateId'; readonly value: string }
export type AssetInstanceId = { readonly kind: 'AssetInstanceId'; readonly value: string }

export const partId = (value: string): PartId => ({ kind: 'PartId', value })
export const slotTag = (value: string): SlotTag => ({ kind: 'SlotTag', value })
export const templateId = (value: string): TemplateId => ({ kind: 'TemplateId', value })
export const textureId = (value: string): TextureId => ({ kind: 'TextureId', value })
export const assetInstanceId = (value: string): AssetInstanceId => ({
  kind: 'AssetInstanceId',
  value,
})

export const isPartId = (value: unknown): value is PartId =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  value.kind === 'PartId' &&
  'value' in value &&
  typeof value.value === 'string'

export const isSlotTag = (value: unknown): value is SlotTag =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  value.kind === 'SlotTag' &&
  'value' in value &&
  typeof value.value === 'string'

export const isTextureId = (value: unknown): value is TextureId =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  value.kind === 'TextureId' &&
  'value' in value &&
  typeof value.value === 'string'

export const isTemplateId = (value: unknown): value is TemplateId =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  value.kind === 'TemplateId' &&
  'value' in value &&
  typeof value.value === 'string'

export const isAssetInstanceId = (value: unknown): value is AssetInstanceId =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  value.kind === 'AssetInstanceId' &&
  'value' in value &&
  typeof value.value === 'string'
