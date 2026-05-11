import type { Vec3 } from '../schema/vec'
import type { Transform } from '../schema/transform'

export { composeTransform, invertTransform, mirrorXTransform } from '../schema/transform'

const snapValue = (value: number, increment: number): number =>
  increment === 0 ? value : Math.round(value / increment) * increment

const snapVec3 = (v: Vec3, increment: number): Vec3 => [
  snapValue(v[0], increment),
  snapValue(v[1], increment),
  snapValue(v[2], increment),
]

const resolveScale = (scale: Vec3 | number): Vec3 =>
  typeof scale === 'number' ? [scale, scale, scale] : scale

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

const nearEqual = (a: number, b: number): boolean => Math.abs(a - b) < EPSILON

const vec3Equal = (a: Vec3, b: Vec3): boolean =>
  nearEqual(a[0], b[0]) && nearEqual(a[1], b[1]) && nearEqual(a[2], b[2])

export const transformEqual = (a: Transform, b: Transform): boolean => {
  if (!vec3Equal(a.position, b.position)) return false
  if (!vec3Equal(a.rotation, b.rotation)) return false
  const sa = resolveScale(a.scale)
  const sb = resolveScale(b.scale)
  return vec3Equal(sa, sb)
}
