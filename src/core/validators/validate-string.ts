import { type Result, ok, err } from '../fp/result'
import type { ValidationError } from '../../schema/validation-error'

export const validateString = (value: unknown, path: string): Result<string, ValidationError> => {
  if (typeof value !== 'string') {
    return err({ path, message: 'Expected a string', received: value })
  }
  return ok(value)
}

export const validateNonEmptyString = (
  value: unknown,
  path: string,
): Result<string, ValidationError> => {
  if (typeof value !== 'string') {
    return err({ path, message: 'Expected a string', received: value })
  }
  if (value.length === 0) {
    return err({ path, message: 'Expected a non-empty string', received: value })
  }
  return ok(value)
}
