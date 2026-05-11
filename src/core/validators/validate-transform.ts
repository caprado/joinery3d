import { type Result, ok, err } from '../fp/result'
import type { Transform } from '../../schema/transform'
import type { ValidationError } from '../../schema/validation-error'
import { validateVec3 } from './validate-vec3'

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const validateTransform = (
  value: unknown,
  path: string,
): Result<Transform, ValidationError> => {
  if (!isRecord(value)) {
    return err({ path, message: 'Expected an object', received: value })
  }

  const positionResult = validateVec3(value['position'], `${path}.position`)
  if (!positionResult.ok) return positionResult

  const rotationResult = validateVec3(value['rotation'], `${path}.rotation`)
  if (!rotationResult.ok) return rotationResult

  const rawScale: unknown = value['scale']
  if (isFiniteNumber(rawScale)) {
    return ok({
      position: positionResult.value,
      rotation: rotationResult.value,
      scale: rawScale,
    })
  }

  const scaleVecResult = validateVec3(rawScale, `${path}.scale`)
  if (!scaleVecResult.ok) {
    return err({
      path: `${path}.scale`,
      message: 'Expected a finite number or a Vec3',
      received: rawScale,
    })
  }

  return ok({
    position: positionResult.value,
    rotation: rotationResult.value,
    scale: scaleVecResult.value,
  })
}
