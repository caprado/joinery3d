import { describe, it, expect } from 'vitest'
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
} from 'three'
import { createPicker } from './picking'

const createTestScene = (): { scene: Scene; camera: PerspectiveCamera } => {
  const scene = new Scene()
  const camera = new PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0, 5)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()

  const assemblyRoot = new Group()
  assemblyRoot.name = 'assembly-root'
  scene.add(assemblyRoot)

  const headGroup = new Group()
  headGroup.name = 'head'
  headGroup.userData = { slotTag: 'head' }
  const headMesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial())
  headMesh.position.set(0, 0, 0)
  headGroup.add(headMesh)
  assemblyRoot.add(headGroup)

  const torsoGroup = new Group()
  torsoGroup.name = 'torso'
  torsoGroup.userData = { slotTag: 'torso' }
  const torsoMesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial())
  torsoMesh.position.set(3, 0, 0)
  torsoGroup.add(torsoMesh)
  assemblyRoot.add(torsoGroup)

  scene.updateMatrixWorld(true)
  return { scene, camera }
}

describe('createPicker', () => {
  it('picks the head slot when clicking on the head mesh', () => {
    const { scene, camera } = createTestScene()
    const picker = createPicker(camera, scene)

    // Center of screen should hit the head (at origin, camera at z=5 looking at origin)
    const result = picker.pick(400, 400, 800, 800)
    expect(result).toBeDefined()
    expect(result?.slotTag).toBe('head')
  })

  it('traverses parent chain to find slotTag userData', () => {
    const { scene, camera } = createTestScene()
    const picker = createPicker(camera, scene)

    // The head mesh is a child of headGroup. When the raycast hits the mesh,
    // it should traverse up to find the slotTag on the parent group.
    const result = picker.pick(400, 400, 800, 800)
    expect(result).toBeDefined()
    expect(result?.slotTag).toBe('head')
  })

  it('returns undefined when clicking empty space', () => {
    const { scene, camera } = createTestScene()
    const picker = createPicker(camera, scene)

    // Far left — nothing there
    const result = picker.pick(0, 400, 800, 800)
    expect(result).toBeUndefined()
  })

  it('returns undefined for zero-size container', () => {
    const { scene, camera } = createTestScene()
    const picker = createPicker(camera, scene)

    const result = picker.pick(100, 100, 0, 0)
    expect(result).toBeUndefined()
  })

  it('returns undefined when assembly-root has no children', () => {
    const scene = new Scene()
    const assemblyRoot = new Group()
    assemblyRoot.name = 'assembly-root'
    scene.add(assemblyRoot)

    const camera = new PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.set(0, 0, 5)
    camera.updateMatrixWorld()

    const picker = createPicker(camera, scene)
    const result = picker.pick(400, 400, 800, 800)
    expect(result).toBeUndefined()
  })
})
