export type Vec3 = readonly [number, number, number]
export type Quat = readonly [number, number, number, number]
export type EulerXYZ = readonly [number, number, number]

export const VEC3_ZERO: Vec3 = [0, 0, 0]
export const VEC3_ONE: Vec3 = [1, 1, 1]

export const vec3 = (x: number, y: number, z: number): Vec3 => [x, y, z]

export const addVec3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

export const scaleVec3 = (v: Vec3, s: number): Vec3 => [v[0] * s, v[1] * s, v[2] * s]

export const mirrorXVec3 = (v: Vec3): Vec3 => [-v[0], v[1], v[2]]

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const isVec3 = (value: unknown): value is Vec3 =>
  Array.isArray(value) &&
  value.length === 3 &&
  isFiniteNumber(value[0]) &&
  isFiniteNumber(value[1]) &&
  isFiniteNumber(value[2])
