import { type Result, ok, err } from '../fp/result'
import { templateId, slotTag, partId } from '../../schema/ids'
import type { Template, SlotDefinition } from '../../schema/template'
import type { ValidationError } from '../../schema/validation-error'
import { isRecord } from './is-record'
import { validateArray } from './validate-array'
import { validateTransform } from './validate-transform'
import { validateNonEmptyString } from './validate-string'
import { validateBoolean } from './validate-boolean'
import { validatePositiveInteger } from './validate-number'

const validateSlotDefinition = (
  value: unknown,
  path: string,
): Result<SlotDefinition, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const tagResult = validateNonEmptyString(value['tag'], `${path}.tag`)
  if (!tagResult.ok) return tagResult

  const nameResult = validateNonEmptyString(value['name'], `${path}.name`)
  if (!nameResult.ok) return nameResult

  const anchorResult = validateTransform(value['anchor'], `${path}.anchor`)
  if (!anchorResult.ok) return anchorResult

  const requiredResult = validateBoolean(value['required'], `${path}.required`)
  if (!requiredResult.ok) return requiredResult

  const rawDefaultPartId: unknown = value['defaultPartId']
  const defaultPartId =
    typeof rawDefaultPartId === 'string' ? partId(rawDefaultPartId) : undefined

  const rawPairedSlot: unknown = value['pairedSlot']
  const pairedSlot = typeof rawPairedSlot === 'string' ? slotTag(rawPairedSlot) : undefined

  return ok({
    tag: slotTag(tagResult.value),
    name: nameResult.value,
    anchor: anchorResult.value,
    defaultPartId,
    pairedSlot,
    required: requiredResult.value,
  })
}

export const validateTemplate = (
  value: unknown,
  path: string,
): Result<Template, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const idResult = validateNonEmptyString(value['id'], `${path}.id`)
  if (!idResult.ok) return idResult

  const nameResult = validateNonEmptyString(value['name'], `${path}.name`)
  if (!nameResult.ok) return nameResult

  const descriptionResult = validateNonEmptyString(value['description'], `${path}.description`)
  if (!descriptionResult.ok) return descriptionResult

  const versionResult = validatePositiveInteger(value['version'], `${path}.version`)
  if (!versionResult.ok) return versionResult

  const slotsResult = validateArray(value['slots'], `${path}.slots`, validateSlotDefinition)
  if (!slotsResult.ok) return slotsResult

  return ok({
    id: templateId(idResult.value),
    name: nameResult.value,
    description: descriptionResult.value,
    slots: slotsResult.value,
    version: versionResult.value,
  })
}
