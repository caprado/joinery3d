import { type Result, ok, err } from '../fp/result'
import { textureId } from '../../schema/ids'
import type { Texture } from '../../schema/texture'
import type { ValidationError } from '../../schema/validation-error'
import { isRecord } from './is-record'
import { validateStringArray } from './validate-array'
import { validateNonEmptyString } from './validate-string'
import { validatePositiveInteger } from './validate-number'

export const validateTexture = (
  value: unknown,
  path: string,
): Result<Texture, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const idResult = validateNonEmptyString(value['id'], `${path}.id`)
  if (!idResult.ok) return idResult

  const nameResult = validateNonEmptyString(value['name'], `${path}.name`)
  if (!nameResult.ok) return nameResult

  const fileResult = validateNonEmptyString(value['file'], `${path}.file`)
  if (!fileResult.ok) return fileResult

  const widthResult = validatePositiveInteger(value['width'], `${path}.width`)
  if (!widthResult.ok) return widthResult

  const heightResult = validatePositiveInteger(value['height'], `${path}.height`)
  if (!heightResult.ok) return heightResult

  const tagsResult = validateStringArray(value['tags'], `${path}.tags`)
  if (!tagsResult.ok) return tagsResult

  return ok({
    id: textureId(idResult.value),
    name: nameResult.value,
    file: fileResult.value,
    width: widthResult.value,
    height: heightResult.value,
    tags: tagsResult.value,
  })
}
