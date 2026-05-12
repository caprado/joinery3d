import type { Vec3, EulerXYZ } from './vec'
import { addVec3, mirrorXVec3, resolveScale } from './vec'

export type Transform = {
  readonly position: Vec3
  readonly rotation: EulerXYZ
  readonly scale: Vec3 | number
}

export const IDENTITY_TRANSFORM: Transform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
}

const multiplyScales = (left: Vec3 | number, right: Vec3 | number): Vec3 => {
  const leftVec = resolveScale(left)
  const rightVec = resolveScale(right)
  return [leftVec[0] * rightVec[0], leftVec[1] * rightVec[1], leftVec[2] * rightVec[2]]
}

export const composeTransform = (base: Transform, offset: Transform): Transform => ({
  position: addVec3(base.position, offset.position),
  rotation: [
    base.rotation[0] + offset.rotation[0],
    base.rotation[1] + offset.rotation[1],
    base.rotation[2] + offset.rotation[2],
  ],
  scale: multiplyScales(base.scale, offset.scale),
})

export const invertTransform = (transform: Transform): Transform => {
  const scale = resolveScale(transform.scale)
  return {
    position: [-transform.position[0], -transform.position[1], -transform.position[2]],
    rotation: [-transform.rotation[0], -transform.rotation[1], -transform.rotation[2]],
    scale: [1 / scale[0], 1 / scale[1], 1 / scale[2]],
  }
}

export const mirrorXTransform = (transform: Transform): Transform => ({
  position: mirrorXVec3(transform.position),
  rotation: [transform.rotation[0], -transform.rotation[1], -transform.rotation[2]],
  scale: transform.scale,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const isTransform = (value: unknown): value is Transform => {
  if (!isRecord(value)) return false
  if (!Array.isArray(value['position']) || value['position'].length !== 3) return false
  if (!Array.isArray(value['rotation']) || value['rotation'].length !== 3) return false
  const hasScale =
    typeof value['scale'] === 'number' ||
    (Array.isArray(value['scale']) && value['scale'].length === 3)
  return hasScale
}
