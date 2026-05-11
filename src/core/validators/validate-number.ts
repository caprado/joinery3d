import { type Result, ok, err } from '../fp/result'
import type { ValidationError } from '../../schema/validation-error'

export const validateFiniteNumber = (
  value: unknown,
  path: string,
): Result<number, ValidationError> => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return err({ path, message: 'Expected a finite number', received: value })
  }
  return ok(value)
}

export const validatePositiveInteger = (
  value: unknown,
  path: string,
): Result<number, ValidationError> => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    return err({ path, message: 'Expected a positive integer', received: value })
  }
  return ok(value)
}
