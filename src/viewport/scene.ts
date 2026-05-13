import {
  AmbientLight,
  Color,
  DirectionalLight,
  HemisphereLight,
  GridHelper,
  Scene,
} from 'three'

export type SceneSetup = {
  readonly scene: Scene
  readonly gridHelper: GridHelper
  readonly setBrightness: (multiplier: number) => void
  readonly setBackgroundColor: (color: string) => void
}

const BASE_AMBIENT = 0.5
const BASE_KEY = 1.0
const BASE_FILL = 0.6
const BASE_BACK = 0.3
const BASE_HEMISPHERE = 0.8

export const createScene = (): SceneSetup => {
  const scene = new Scene()
  scene.background = new Color('#1a1a1a')

  const hemisphereLight = new HemisphereLight(0xddeeff, 0x555555, BASE_HEMISPHERE)
  scene.add(hemisphereLight)

  const ambientLight = new AmbientLight(0xffffff, BASE_AMBIENT)
  scene.add(ambientLight)

  const keyLight = new DirectionalLight(0xffffff, BASE_KEY)
  keyLight.position.set(5, 10, 7)
  scene.add(keyLight)

  const fillLight = new DirectionalLight(0xffffff, BASE_FILL)
  fillLight.position.set(-5, 5, -5)
  scene.add(fillLight)

  const backLight = new DirectionalLight(0xffffff, BASE_BACK)
  backLight.position.set(0, 3, -8)
  scene.add(backLight)

  const gridHelper = new GridHelper(10, 20, 0x444444, 0x222222)
  scene.add(gridHelper)

  const setBrightness = (multiplier: number): void => {
    ambientLight.intensity = BASE_AMBIENT * multiplier
    keyLight.intensity = BASE_KEY * multiplier
    fillLight.intensity = BASE_FILL * multiplier
    backLight.intensity = BASE_BACK * multiplier
    hemisphereLight.intensity = BASE_HEMISPHERE * multiplier
  }

  const setBackgroundColor = (color: string): void => {
    scene.background = new Color(color)
  }

  return { scene, gridHelper, setBrightness, setBackgroundColor }
}

export const setGridVisible = (setup: SceneSetup, isVisible: boolean): void => {
  setup.gridHelper.visible = isVisible
}
