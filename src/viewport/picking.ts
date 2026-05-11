import { Raycaster, Vector2, Object3D, PerspectiveCamera, Scene } from 'three'

export type PickResult = {
  readonly slotTag: string
} | undefined

const findSlotTag = (object: Object3D): string | undefined => {
  let current: Object3D | null = object
  while (current !== null) {
    const tag: unknown = current.userData.slotTag
    if (typeof tag === 'string') return tag
    current = current.parent
  }
  return undefined
}

export type Picker = {
  readonly pick: (
    screenX: number,
    screenY: number,
    containerWidth: number,
    containerHeight: number,
  ) => PickResult
}

export const createPicker = (
  camera: PerspectiveCamera,
  scene: Scene,
): Picker => {
  const raycaster = new Raycaster()
  const pointer = new Vector2()

  const pick = (
    screenX: number,
    screenY: number,
    containerWidth: number,
    containerHeight: number,
  ): PickResult => {
    if (containerWidth === 0 || containerHeight === 0) return undefined

    pointer.x = (screenX / containerWidth) * 2 - 1
    pointer.y = -(screenY / containerHeight) * 2 + 1

    raycaster.setFromCamera(pointer, camera)

    const assemblyRoot = scene.getObjectByName('assembly-root')
    if (assemblyRoot === undefined) return undefined

    const intersects = raycaster.intersectObjects(assemblyRoot.children, true)
    if (intersects.length === 0) return undefined

    const firstHit = intersects[0]
    if (firstHit === undefined) return undefined

    const tag = findSlotTag(firstHit.object)
    if (tag === undefined) return undefined

    return { slotTag: tag }
  }

  return { pick }
}
