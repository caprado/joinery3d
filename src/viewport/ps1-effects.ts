import {
  DoubleSide,
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
  readonly brightness: number
}

export const DEFAULT_PS1_CONFIG: Ps1EffectsConfig = {
  screenResolution: [320, 240],
  isEnabled: false,
  brightness: 1.0,
}

const ps1VertexShader = `
  uniform vec2 screenResolution;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(normalMatrix * normal);

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);

    vec4 clipPos = projectionMatrix * mvPos;

    // Vertex snapping: snap XY to screen-space grid, preserve Z depth
    vec2 snapped = floor(clipPos.xy / clipPos.w * screenResolution * 0.5 + 0.5)
                   / (screenResolution * 0.5) * clipPos.w;
    clipPos.x = snapped.x;
    clipPos.y = snapped.y;

    gl_Position = clipPos;
  }
`

const ps1FragmentShader = `
  uniform sampler2D map;
  uniform bool hasMap;
  uniform vec3 diffuse;
  uniform float opacity;
  uniform float brightness;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(vViewDir);

    // Lighting: key + fill + ambient
    vec3 keyDir = normalize(vec3(0.5, 1.0, 0.7));
    vec3 fillDir = normalize(vec3(-0.5, 0.3, -0.5));
    float keyNdotL = max(dot(normal, keyDir), 0.0);
    float fillNdotL = max(dot(normal, fillDir), 0.0);
    vec3 lighting = vec3(0.4) + vec3(0.5) * keyNdotL + vec3(0.2) * fillNdotL;

    // Edge darkening: faces at grazing angles get darker (shows depth)
    float edgeFactor = max(dot(normal, viewDir), 0.0);
    float edgeDarken = mix(0.3, 1.0, edgeFactor);

    lighting *= edgeDarken * brightness;

    vec3 baseColor;
    float alpha;
    if (hasMap) {
      vec4 texColor = texture2D(map, vUv);
      baseColor = texColor.rgb * diffuse;
      alpha = texColor.a * opacity;
    } else {
      baseColor = diffuse;
      alpha = opacity;
    }

    gl_FragColor = vec4(baseColor * lighting, alpha);
  }
`

export type CreatePs1MaterialArgs = {
  readonly texture: Texture | undefined
  readonly screenResolution: readonly [number, number]
  readonly brightness: number
}

export const createPs1Material = (args: CreatePs1MaterialArgs): ShaderMaterial => {
  const uniforms = UniformsUtils.merge([
    UniformsLib.common,
    {
      screenResolution: { value: [args.screenResolution[0], args.screenResolution[1]] },
      brightness: { value: args.brightness },
      hasMap: { value: args.texture !== undefined },
    },
  ])

  if (args.texture !== undefined) {
    uniforms.map = { value: args.texture }
  }

  return new ShaderMaterial({
    uniforms,
    vertexShader: ps1VertexShader,
    fragmentShader: ps1FragmentShader,
    depthTest: true,
    depthWrite: true,
    side: DoubleSide,
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
      brightness: config.brightness,
    })
  })
}

export const updatePs1Brightness = (object: Object3D, brightness: number): void => {
  object.traverse((child) => {
    if (!('material' in child)) return
    const material: unknown = child.material
    if (material instanceof ShaderMaterial) {
      const uniform = material.uniforms['brightness']
      if (uniform !== undefined) {
        uniform.value = brightness
      }
    }
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
