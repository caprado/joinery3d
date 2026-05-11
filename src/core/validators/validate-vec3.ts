import { type Result, ok, err } from '../fp/result'
import type { Vec3 } from '../../schema/vec'
import type { ValidationError } from '../../schema/validation-error'

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const validateVec3 = (value: unknown, path: string): Result<Vec3, ValidationError> => {
  if (!Array.isArray(value)) {
    return err({ path, message: 'Expected an array', received: value })
  }
  if (value.length !== 3) {
    return err({ path, message: 'Expected array of length 3', received: value })
  }
  const [x, y, z] = value as unknown as readonly [unknown, unknown, unknown]
  if (!isFiniteNumber(x)) {
    return err({ path: `${path}[0]`, message: 'Expected a finite number', received: x })
  }
  if (!isFiniteNumber(y)) {
    return err({ path: `${path}[1]`, message: 'Expected a finite number', received: y })
  }
  if (!isFiniteNumber(z)) {
    return err({ path: `${path}[2]`, message: 'Expected a finite number', received: z })
  }
  return ok([x, y, z] as const)
}
