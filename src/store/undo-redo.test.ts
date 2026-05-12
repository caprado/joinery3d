import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  textureId,
  assetInstanceId,
} from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { createAppStore } from './store'

const headTag = slotTag('head')
const headPartId = partId('head_male_base')
const headElfPartId = partId('head_elf')
const skinPaleId = textureId('skin_pale')
const skinDarkId = textureId('skin_dark')

const testInstance: AssetInstance = {
  id: assetInstanceId('test'),
  name: 'Test Asset',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: {
      partId: headPartId,
      offset: IDENTITY_TRANSFORM,
      textures: { diffuse: skinPaleId },
    },
  },
}

describe('undo/redo through store', () => {
  it('undoes a slot part swap', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    store.getState().setSlotPart(headTag, headElfPartId)
    expect(store.getState().currentInstance?.slots['head']?.partId.value).toBe('head_elf')

    store.getState().undo()
    expect(store.getState().currentInstance?.slots['head']?.partId.value).toBe('head_male_base')
  })

  it('redoes a slot part swap', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    store.getState().setSlotPart(headTag, headElfPartId)
    store.getState().undo()
    expect(store.getState().currentInstance?.slots['head']?.partId.value).toBe('head_male_base')

    store.getState().redo()
    expect(store.getState().currentInstance?.slots['head']?.partId.value).toBe('head_elf')
  })

  it('undoes a transform change', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    const newOffset = { position: [1, 2, 3] as const, rotation: [0, 0, 0] as const, scale: 1 }
    store.getState().setSlotOffset(headTag, newOffset)
    expect(store.getState().currentInstance?.slots['head']?.offset.position).toStrictEqual([1, 2, 3])

    store.getState().undo()
    expect(store.getState().currentInstance?.slots['head']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
  })

  it('undoes a texture change', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    store.getState().setSlotTexture(headTag, 'diffuse', skinDarkId)
    expect(store.getState().currentInstance?.slots['head']?.textures['diffuse']?.value).toBe('skin_dark')

    store.getState().undo()
    expect(store.getState().currentInstance?.slots['head']?.textures['diffuse']?.value).toBe('skin_pale')
  })

  it('supports multiple undo steps', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    store.getState().setSlotPart(headTag, headElfPartId)
    const newOffset = { position: [0, 0.1, 0] as const, rotation: [0, 0, 0] as const, scale: 1 }
    store.getState().setSlotOffset(headTag, newOffset)

    store.getState().undo()
    expect(store.getState().currentInstance?.slots['head']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
    expect(store.getState().currentInstance?.slots['head']?.partId.value).toBe('head_elf')

    store.getState().undo()
    expect(store.getState().currentInstance?.slots['head']?.partId.value).toBe('head_male_base')
  })

  it('undo does nothing with empty history', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    store.getState().undo()
    expect(store.getState().currentInstance?.name).toBe('Test Asset')
  })

  it('redo does nothing with empty future', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    store.getState().redo()
    expect(store.getState().currentInstance?.name).toBe('Test Asset')
  })

  it('new action clears redo future', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)

    store.getState().setSlotPart(headTag, headElfPartId)
    store.getState().undo()
    expect(store.getState().history.future).toHaveLength(1)

    store.getState().setSlotTexture(headTag, 'diffuse', skinDarkId)
    expect(store.getState().history.future).toHaveLength(0)
  })

  it('selection changes are NOT undoable', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    store.getState().setSelection({ kind: 'slot', slotTag: headTag })

    expect(store.getState().history.past).toHaveLength(0)
  })
})
