import { type Result, ok, err } from '../fp/result'
import type { ValidationError } from '../../schema/validation-error'

export const validateArray = <T>(
  value: unknown,
  path: string,
  validateItem: (item: unknown, itemPath: string) => Result<T, ValidationError>,
): Result<readonly T[], ValidationError> => {
  if (!Array.isArray(value)) {
    return err({ path, message: 'Expected an array', received: value })
  }
  const length: number = value.length
  return Array.from({ length }, (_, index) => index).reduce<
    Result<readonly T[], ValidationError>
  >(
    (acc, index) => {
      if (!acc.ok) return acc
      const item: unknown = value[index]
      const itemResult = validateItem(item, `${path}[${String(index)}]`)
      if (!itemResult.ok) return itemResult
      return ok([...acc.value, itemResult.value])
    },
    ok([]),
  )
}

export const validateStringArray = (
  value: unknown,
  path: string,
): Result<readonly string[], ValidationError> =>
  validateArray(value, path, (item, itemPath) => {
    if (typeof item !== 'string') {
      return err({ path: itemPath, message: 'Expected a string', received: item })
    }
    return ok(item)
  })
