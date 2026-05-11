import {
  AmbientLight,
  DirectionalLight,
  GridHelper,
  Scene,
} from 'three'

export type SceneSetup = {
  readonly scene: Scene
  readonly gridHelper: GridHelper
}

export const createScene = (): SceneSetup => {
  const scene = new Scene()

  const ambientLight = new AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7)
  scene.add(directionalLight)

  const gridHelper = new GridHelper(10, 20, 0x444444, 0x222222)
  scene.add(gridHelper)

  return { scene, gridHelper }
}

export const setGridVisible = (setup: SceneSetup, isVisible: boolean): void => {
  setup.gridHelper.visible = isVisible
}
