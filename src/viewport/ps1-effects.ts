import {
  ShaderMaterial,
  UniformsUtils,
  UniformsLib,
  Mesh,
  Texture,
  type Object3D,
  type Material,
} from 'three'

export type Ps1EffectsConfig = {
  readonly screenResolution: readonly [number, number]
  readonly isEnabled: boolean
}

export const DEFAULT_PS1_CONFIG: Ps1EffectsConfig = {
  screenResolution: [320, 240],
  isEnabled: false,
}

const ps1VertexShader = `
  uniform vec2 screenResolution;

  varying vec2 vUv;
  varying float vAffineW;

  void main() {
    vUv = uv;

    vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // Vertex snapping: snap to screen-space grid
    vec2 snapped = floor(clipPos.xy / clipPos.w * screenResolution * 0.5 + 0.5)
                   / (screenResolution * 0.5) * clipPos.w;
    clipPos.xy = snapped;

    // Pass W for affine correction removal
    vAffineW = clipPos.w;
    vUv *= clipPos.w;

    gl_Position = clipPos;
  }
`

const ps1FragmentShader = `
  uniform sampler2D map;
  uniform vec3 diffuse;
  uniform float opacity;

  varying vec2 vUv;
  varying float vAffineW;

  void main() {
    // Affine texture mapping: divide by W to undo perspective correction
    vec2 affineUv = vUv / vAffineW;
    vec4 texColor = texture2D(map, affineUv);
    gl_FragColor = vec4(texColor.rgb * diffuse, texColor.a * opacity);
  }
`

export type CreatePs1MaterialArgs = {
  readonly texture: Texture | undefined
  readonly screenResolution: readonly [number, number]
}

export const createPs1Material = (args: CreatePs1MaterialArgs): ShaderMaterial => {
  const uniforms = UniformsUtils.merge([
    UniformsLib.common,
    {
      screenResolution: { value: [args.screenResolution[0], args.screenResolution[1]] },
    },
  ])

  if (args.texture !== undefined) {
    uniforms.map = { value: args.texture }
  }

  return new ShaderMaterial({
    uniforms,
    vertexShader: ps1VertexShader,
    fragmentShader: ps1FragmentShader,
  })
}

export const applyPs1MaterialToObject = (
  object: Object3D,
  config: Ps1EffectsConfig,
): void => {
  object.traverse((child) => {
    if (!isMeshObject(child)) return
    const firstMaterial = getFirstMaterial(child.material)
    const texture = firstMaterial !== undefined ? getTextureFromMaterial(firstMaterial) : undefined
    child.material = createPs1Material({
      texture,
      screenResolution: config.screenResolution,
    })
  })
}

export const removePs1MaterialFromObject = (
  object: Object3D,
  originalMaterials: Map<string, Material | Material[]>,
): void => {
  object.traverse((child) => {
    if (!isMeshObject(child)) return
    const original = originalMaterials.get(child.uuid)
    if (original !== undefined) {
      child.material = original
    }
  })
}

export const captureOriginalMaterials = (object: Object3D): Map<string, Material | Material[]> => {
  const materials = new Map<string, Material | Material[]>()
  object.traverse((child) => {
    if (!isMeshObject(child)) return
    materials.set(child.uuid, child.material)
  })
  return materials
}

const isMeshObject = (child: Object3D): child is Mesh => {
  return child instanceof Mesh
}

const getFirstMaterial = (material: Material | Material[]): Material | undefined => {
  if (Array.isArray(material)) return material[0]
  return material
}

const getTextureFromMaterial = (material: Material): Texture | undefined => {
  if (!('map' in material)) return undefined
  const mapValue: unknown = material.map
  if (mapValue instanceof Texture) return mapValue
  return undefined
}
