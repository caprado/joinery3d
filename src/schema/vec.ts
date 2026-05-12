export type Vec3 = readonly [number, number, number]
export type Quat = readonly [number, number, number, number]
export type EulerXYZ = readonly [number, number, number]

export const VEC3_ZERO: Vec3 = [0, 0, 0]
export const VEC3_ONE: Vec3 = [1, 1, 1]

export const vec3 = (x: number, y: number, z: number): Vec3 => [x, y, z]

export const addVec3 = (left: Vec3, right: Vec3): Vec3 => [
  left[0] + right[0],
  left[1] + right[1],
  left[2] + right[2],
]

export const scaleVec3 = (vec: Vec3, scalar: number): Vec3 => [
  vec[0] * scalar,
  vec[1] * scalar,
  vec[2] * scalar,
]

export const mirrorXVec3 = (vec: Vec3): Vec3 => [-vec[0], vec[1], vec[2]]

export const setVec3Component = (vec: Vec3, index: 0 | 1 | 2, value: number): Vec3 => [
  index === 0 ? value : vec[0],
  index === 1 ? value : vec[1],
  index === 2 ? value : vec[2],
]

export const resolveScale = (scale: Vec3 | number): Vec3 =>
  typeof scale === 'number' ? [scale, scale, scale] : scale

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const isVec3 = (value: unknown): value is Vec3 =>
  Array.isArray(value) &&
  value.length === 3 &&
  isFiniteNumber(value[0]) &&
  isFiniteNumber(value[1]) &&
  isFiniteNumber(value[2])
