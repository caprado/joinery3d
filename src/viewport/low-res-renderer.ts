import {
  WebGLRenderTarget,
  NearestFilter,
  type WebGLRenderer,
  type Scene,
  type PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  OrthographicCamera,
  Scene as ThreeScene,
} from 'three'

export type LowResRendererConfig = {
  readonly renderWidth: number
  readonly renderHeight: number
  readonly isEnabled: boolean
}

export const DEFAULT_LOW_RES_CONFIG: LowResRendererConfig = {
  renderWidth: 320,
  renderHeight: 240,
  isEnabled: false,
}

export type LowResRenderer = {
  readonly render: (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: PerspectiveCamera,
    outputWidth: number,
    outputHeight: number,
  ) => void
  readonly dispose: () => void
}

const upscaleVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const upscaleFragmentShader = `
  uniform sampler2D renderTexture;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(renderTexture, vUv);
  }
`

export const createLowResRenderer = (config: LowResRendererConfig): LowResRenderer => {
  const renderTarget = new WebGLRenderTarget(config.renderWidth, config.renderHeight, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
  })

  const upscaleMaterial = new ShaderMaterial({
    uniforms: {
      renderTexture: { value: renderTarget.texture },
    },
    vertexShader: upscaleVertexShader,
    fragmentShader: upscaleFragmentShader,
  })

  const fullscreenQuad = new Mesh(new PlaneGeometry(2, 2), upscaleMaterial)
  const orthoCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const upscaleScene = new ThreeScene()
  upscaleScene.add(fullscreenQuad)

  const render = (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: PerspectiveCamera,
    outputWidth: number,
    outputHeight: number,
  ): void => {
    renderer.setRenderTarget(renderTarget)
    renderer.setSize(config.renderWidth, config.renderHeight, false)
    renderer.render(scene, camera)

    renderer.setRenderTarget(null)
    renderer.setSize(outputWidth, outputHeight, false)
    renderer.render(upscaleScene, orthoCamera)
  }

  const dispose = (): void => {
    renderTarget.dispose()
    upscaleMaterial.dispose()
    fullscreenQuad.geometry.dispose()
  }

  return { render, dispose }
}
