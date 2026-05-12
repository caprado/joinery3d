import { type Result, ok, err } from '../fp/result'
import { partId, slotTag, textureId } from '../../schema/ids'
import type { Part, TextureSlot, TextureChannel } from '../../schema/part'
import type { ValidationError } from '../../schema/validation-error'
import { isRecord } from './is-record'
import { validateArray, validateStringArray } from './validate-array'
import { validateTransform } from './validate-transform'
import { validateNonEmptyString, validateString } from './validate-string'

const VALID_TEXTURE_CHANNELS: readonly string[] = ['diffuse', 'normal', 'specular', 'emissive']

const isTextureChannel = (value: string): value is TextureChannel =>
  VALID_TEXTURE_CHANNELS.includes(value)

const validateTextureSlot = (
  value: unknown,
  path: string,
): Result<TextureSlot, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const channelResult = validateString(value['channel'], `${path}.channel`)
  if (!channelResult.ok) return channelResult

  if (!isTextureChannel(channelResult.value)) {
    return err({
      path: `${path}.channel`,
      message: `Expected one of: ${VALID_TEXTURE_CHANNELS.join(', ')}`,
      received: channelResult.value,
    })
  }

  const rawDefaultTextureId: unknown = value['defaultTextureId']
  const defaultTextureId =
    typeof rawDefaultTextureId === 'string' ? textureId(rawDefaultTextureId) : undefined

  const rawVariants: unknown = value['variants']
  const variants = Array.isArray(rawVariants)
    ? Array.from({ length: rawVariants.length }, (_, index) => {
        const entry: unknown = rawVariants[index]
        if (!isRecord(entry)) return undefined
        if (typeof entry['name'] !== 'string' || typeof entry['textureId'] !== 'string') return undefined
        return { name: entry['name'], textureId: textureId(entry['textureId']) }
      }).filter((entry): entry is { name: string; textureId: ReturnType<typeof textureId> } => entry !== undefined)
    : []

  return ok({
    channel: channelResult.value,
    defaultTextureId,
    variants,
  })
}

export const validatePart = (value: unknown, path: string): Result<Part, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const idResult = validateNonEmptyString(value['id'], `${path}.id`)
  if (!idResult.ok) return idResult

  const nameResult = validateNonEmptyString(value['name'], `${path}.name`)
  if (!nameResult.ok) return nameResult

  const tagsResult = validateStringArray(value['tags'], `${path}.tags`)
  if (!tagsResult.ok) return tagsResult
  const tags = tagsResult.value.map((tag) => slotTag(tag))

  const meshFileResult = validateNonEmptyString(value['meshFile'], `${path}.meshFile`)
  if (!meshFileResult.ok) return meshFileResult

  const defaultOffsetResult = validateTransform(value['defaultOffset'], `${path}.defaultOffset`)
  if (!defaultOffsetResult.ok) return defaultOffsetResult

  const textureSlotsResult = validateArray(
    value['textureSlots'],
    `${path}.textureSlots`,
    validateTextureSlot,
  )
  if (!textureSlotsResult.ok) return textureSlotsResult

  const rawThumbnail: unknown = value['thumbnailFile']
  const thumbnailFile = typeof rawThumbnail === 'string' ? rawThumbnail : undefined

  return ok({
    id: partId(idResult.value),
    name: nameResult.value,
    tags,
    meshFile: meshFileResult.value,
    defaultOffset: defaultOffsetResult.value,
    textureSlots: textureSlotsResult.value,
    thumbnailFile,
  })
}
