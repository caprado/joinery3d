import { type Result, ok, err } from '../fp/result'
import type { ValidationError } from '../../schema/validation-error'

export const validateBoolean = (
  value: unknown,
  path: string,
): Result<boolean, ValidationError> => {
  if (typeof value !== 'boolean') {
    return err({ path, message: 'Expected a boolean', received: value })
  }
  return ok(value)
}
