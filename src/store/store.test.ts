import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  textureId,
  assetInstanceId,
} from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import type { Part } from '../schema/part'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { emptyLibrary } from '../schema/library'
import type { LibraryIndex } from '../schema/library'
import { createAppStore } from './store'
import { selectSelectedSlotTag } from './selectors/select-selected-slot-tag'
import { selectCurrentSlot } from './selectors/select-current-slot'
import { selectAvailablePartsForSelection } from './selectors/select-available-parts-for-selection'

const headTag = slotTag('head')
const headPartId = partId('head_male_base')
const headElfPartId = partId('head_elf')

const headPart: Part = {
  id: headPartId,
  name: 'Male Head',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const headElfPart: Part = {
  id: headElfPartId,
  name: 'Elf Head',
  tags: [headTag],
  meshFile: 'parts/head/head_elf.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const testLibrary: LibraryIndex = {
  ...emptyLibrary,
  parts: {
    [headPartId.value]: headPart,
    [headElfPartId.value]: headElfPart,
  },
  partsByTag: {
    [headTag.value]: [headPartId, headElfPartId],
  },
}

const testInstance: AssetInstance = {
  id: assetInstanceId('test'),
  name: 'Test Asset',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: {
      partId: headPartId,
      offset: IDENTITY_TRANSFORM,
      textures: { diffuse: textureId('skin_pale') },
    },
  },
}

describe('createAppStore', () => {
  it('creates a store with initial state', () => {
    const store = createAppStore()
    const state = store.getState()
    expect(state.selection).toStrictEqual({ kind: 'none' })
    expect(state.toolMode).toBe('translate')
    expect(state.currentInstance).toBeUndefined()
  })

  it('loads a library', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(testLibrary, '/path/to/lib')
    const state = store.getState()
    expect(state.library.parts['head_male_base']).toBeDefined()
    expect(state.libraryPath).toBe('/path/to/lib')
  })

  it('creates an instance', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    expect(store.getState().currentInstance?.name).toBe('Test Asset')
  })

  it('updates state when calling setSlotPart', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(testLibrary, '/lib')
    store.getState().instanceCreated(testInstance)
    store.getState().setSlotPart(headTag, headElfPartId)
    expect(store.getState().currentInstance?.slots['head']?.partId.value).toBe('head_elf')
    expect(store.getState().dirty).toBe(true)
  })

  it('sets selection and selectors reflect it', () => {
    const store = createAppStore()
    store.getState().libraryLoaded(testLibrary, '/lib')
    store.getState().instanceCreated(testInstance)
    store.getState().setSelection({ kind: 'slot', slotTag: headTag })

    const state = store.getState()
    expect(selectSelectedSlotTag(state)?.value).toBe('head')
    expect(selectCurrentSlot(state)?.partId.value).toBe('head_male_base')
    expect(selectAvailablePartsForSelection(state)).toHaveLength(2)
  })

  it('changes tool mode', () => {
    const store = createAppStore()
    store.getState().setToolMode('rotate')
    expect(store.getState().toolMode).toBe('rotate')
  })

  it('toggles view options', () => {
    const store = createAppStore()
    store.getState().toggleViewOption('wireframe')
    expect(store.getState().viewOptions.wireframe).toBe(true)
  })

  it('sets editor options', () => {
    const store = createAppStore()
    store.getState().setEditorOption({ snapEnabled: true, snapTranslation: 0.1 })
    expect(store.getState().editorOptions.snapEnabled).toBe(true)
    expect(store.getState().editorOptions.snapTranslation).toBe(0.1)
  })

  it('marks dirty false after save', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    store.getState().setSlotPart(headTag, headElfPartId)
    expect(store.getState().dirty).toBe(true)
    store.getState().instanceSaved('/saved.json')
    expect(store.getState().dirty).toBe(false)
    expect(store.getState().currentProjectPath).toBe('/saved.json')
  })
})
