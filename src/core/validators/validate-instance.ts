import { type Result, ok, err } from '../fp/result'
import { assetInstanceId, partId, templateId, textureId } from '../../schema/ids'
import type { TextureId } from '../../schema/ids'
import type { AssetInstance, SlotAssignment } from '../../schema/instance'
import type { TextureChannel } from '../../schema/part'
import type { ValidationError } from '../../schema/validation-error'
import { isRecord } from './is-record'
import { validateTransform } from './validate-transform'
import { validateNonEmptyString } from './validate-string'
import { validatePositiveInteger } from './validate-number'

const VALID_TEXTURE_CHANNELS: readonly string[] = ['diffuse', 'normal', 'specular', 'emissive']

const isTextureChannel = (value: string): value is TextureChannel =>
  VALID_TEXTURE_CHANNELS.includes(value)

const validateTextures = (
  value: unknown,
  path: string,
): Result<Readonly<Partial<Record<TextureChannel, TextureId>>>, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const invalidKey = Object.keys(value).find((key) => !isTextureChannel(key))
  if (invalidKey !== undefined) {
    return err({
      path: `${path}.${invalidKey}`,
      message: `Unknown texture channel: ${invalidKey}`,
      received: invalidKey,
    })
  }

  const entries: ReadonlyArray<readonly [TextureChannel, TextureId]> = Object.keys(value)
    .filter((key): key is TextureChannel => isTextureChannel(key) && typeof value[key] === 'string')
    .map((key) => [key, textureId(String(value[key]))])

  return ok(Object.fromEntries(entries))
}

const validateSlotAssignment = (
  value: unknown,
  path: string,
): Result<SlotAssignment, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const partIdResult = validateNonEmptyString(value['partId'], `${path}.partId`)
  if (!partIdResult.ok) return partIdResult

  const offsetResult = validateTransform(value['offset'], `${path}.offset`)
  if (!offsetResult.ok) return offsetResult

  const texturesResult = validateTextures(value['textures'], `${path}.textures`)
  if (!texturesResult.ok) return texturesResult

  return ok({
    partId: partId(partIdResult.value),
    offset: offsetResult.value,
    textures: texturesResult.value,
  })
}

const validateSlots = (
  value: unknown,
  path: string,
): Result<Readonly<Partial<Record<string, SlotAssignment>>>, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  return Object.keys(value).reduce<
    Result<Readonly<Partial<Record<string, SlotAssignment>>>, ValidationError>
  >(
    (acc, key) => {
      if (!acc.ok) return acc
      const slotResult = validateSlotAssignment(value[key], `${path}.${key}`)
      if (!slotResult.ok) return slotResult
      return ok({ ...acc.value, [key]: slotResult.value })
    },
    ok({}),
  )
}

export const validateInstance = (
  value: unknown,
  path: string,
): Result<AssetInstance, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const idResult = validateNonEmptyString(value['id'], `${path}.id`)
  if (!idResult.ok) return idResult

  const nameResult = validateNonEmptyString(value['name'], `${path}.name`)
  if (!nameResult.ok) return nameResult

  const templateIdResult = validateNonEmptyString(value['templateId'], `${path}.templateId`)
  if (!templateIdResult.ok) return templateIdResult

  const versionResult = validatePositiveInteger(value['version'], `${path}.version`)
  if (!versionResult.ok) return versionResult

  const slotsResult = validateSlots(value['slots'], `${path}.slots`)
  if (!slotsResult.ok) return slotsResult

  return ok({
    id: assetInstanceId(idResult.value),
    name: nameResult.value,
    templateId: templateId(templateIdResult.value),
    slots: slotsResult.value,
    version: versionResult.value,
  })
}
