import type { Vec3 } from '../schema/vec'
import { resolveScale } from '../schema/vec'
import type { Transform } from '../schema/transform'

export { composeTransform, invertTransform, mirrorXTransform } from '../schema/transform'

const snapValue = (value: number, increment: number): number =>
  increment === 0 ? value : Math.round(value / increment) * increment

const snapVec3 = (vec: Vec3, increment: number): Vec3 => [
  snapValue(vec[0], increment),
  snapValue(vec[1], increment),
  snapValue(vec[2], increment),
]

export const applySnap = (
  transform: Transform,
  snapTranslation: number,
  snapRotation: number,
  snapScale: number,
): Transform => ({
  position: snapVec3(transform.position, snapTranslation),
  rotation: snapVec3(transform.rotation, snapRotation),
  scale:
    typeof transform.scale === 'number'
      ? snapValue(transform.scale, snapScale)
      : snapVec3(transform.scale, snapScale),
})

const EPSILON = 1e-9

const nearEqual = (left: number, right: number): boolean => Math.abs(left - right) < EPSILON

const vec3Equal = (left: Vec3, right: Vec3): boolean =>
  nearEqual(left[0], right[0]) && nearEqual(left[1], right[1]) && nearEqual(left[2], right[2])

export const transformEqual = (left: Transform, right: Transform): boolean => {
  if (!vec3Equal(left.position, right.position)) return false
  if (!vec3Equal(left.rotation, right.rotation)) return false
  const leftScale = resolveScale(left.scale)
  const rightScale = resolveScale(right.scale)
  return vec3Equal(leftScale, rightScale)
}
