import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  assetInstanceId,
} from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import type { Transform } from '../schema/transform'
import { createAppStore } from './store'

const headTag = slotTag('head')
const headPartId = partId('head_male_base')

const testInstance: AssetInstance = {
  id: assetInstanceId('test'),
  name: 'Test',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: { partId: headPartId, offset: IDENTITY_TRANSFORM, textures: {} },
  },
}

describe('snap-to-grid', () => {
  it('does not snap when snapEnabled is false', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    const offset: Transform = { position: [0.07, 0.12, 0.23], rotation: [0, 0, 0], scale: 1 }
    store.getState().setSlotOffset(headTag, offset)

    expect(store.getState().currentInstance?.slots['head']?.offset.position).toStrictEqual([0.07, 0.12, 0.23])
  })

  it('snaps position to translation increment when enabled', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    store.getState().setEditorOption({ snapEnabled: true, snapTranslation: 0.05 })

    const offset: Transform = { position: [0.07, 0.12, 0.23], rotation: [0, 0, 0], scale: 1 }
    store.getState().setSlotOffset(headTag, offset)

    const pos = store.getState().currentInstance?.slots['head']?.offset.position
    expect(pos?.[0]).toBeCloseTo(0.05)
    expect(pos?.[1]).toBeCloseTo(0.10)
    expect(pos?.[2]).toBeCloseTo(0.25)
  })

  it('snaps rotation to rotation increment when enabled', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    store.getState().setEditorOption({ snapEnabled: true, snapRotation: 0.1 })

    const offset: Transform = { position: [0, 0, 0], rotation: [0.08, 0.17, 0.26], scale: 1 }
    store.getState().setSlotOffset(headTag, offset)

    const rot = store.getState().currentInstance?.slots['head']?.offset.rotation
    expect(rot?.[0]).toBeCloseTo(0.1)
    expect(rot?.[1]).toBeCloseTo(0.2)
    expect(rot?.[2]).toBeCloseTo(0.3)
  })

  it('snaps scale to scale increment when enabled', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    store.getState().setEditorOption({ snapEnabled: true, snapScale: 0.1 })

    const offset: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1.17 }
    store.getState().setSlotOffset(headTag, offset)

    expect(store.getState().currentInstance?.slots['head']?.offset.scale).toBeCloseTo(1.2)
  })

  it('with snap enabled at 0.05, transform values round to multiples of 0.05', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    store.getState().setEditorOption({ snapEnabled: true, snapTranslation: 0.05 })

    const offset: Transform = { position: [0.123, 0.456, 0.789], rotation: [0, 0, 0], scale: 1 }
    store.getState().setSlotOffset(headTag, offset)

    const pos = store.getState().currentInstance?.slots['head']?.offset.position
    expect(pos?.[0]).toBeCloseTo(0.10)
    expect(pos?.[1]).toBeCloseTo(0.45)
    expect(pos?.[2]).toBeCloseTo(0.80)
  })
})
