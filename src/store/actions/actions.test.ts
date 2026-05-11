import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  textureId,
  assetInstanceId,
} from '../../schema/ids'
import type { AssetInstance } from '../../schema/instance'
import type { LibraryIndex } from '../../schema/library'
import { emptyLibrary } from '../../schema/library'
import type { Part } from '../../schema/part'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import type { Transform } from '../../schema/transform'
import type { AppState } from '../state'
import { initialState } from '../state'
import { libraryLoaded } from './library-loaded'
import { libraryReloaded } from './library-reloaded'
import { instanceCreated } from './instance-created'
import { instanceLoaded } from './instance-loaded'
import { instanceSaved } from './instance-saved'
import { instanceRenamed } from './instance-renamed'
import { setSlotPart } from './set-slot-part'
import { setSlotOffset } from './set-slot-offset'
import { resetSlotOffset } from './reset-slot-offset'
import { setSlotTexture } from './set-slot-texture'
import { savePartDefaultOffset } from './save-part-default-offset'
import { setSelection } from './set-selection'
import { setToolMode } from './set-tool-mode'
import { toggleViewOption } from './toggle-view-option'
import { setEditorOption } from './set-editor-option'
import { undo } from './undo'
import { redo } from './redo'

const headTag = slotTag('head')
const headPartId = partId('head_male_base')
const skinTextureId = textureId('skin_pale')

const testInstance: AssetInstance = {
  id: assetInstanceId('test'),
  name: 'Test Asset',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: {
      partId: headPartId,
      offset: IDENTITY_TRANSFORM,
      textures: { diffuse: skinTextureId },
    },
  },
}

const headPart: Part = {
  id: headPartId,
  name: 'Male Head',
  tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb',
  defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [],
  thumbnailFile: undefined,
}

const populatedLibrary: LibraryIndex = {
  ...emptyLibrary,
  parts: { [headPartId.value]: headPart },
  partsByTag: { [headTag.value]: [headPartId] },
}

const stateWithInstance: AppState = {
  ...initialState,
  library: populatedLibrary,
  currentInstance: testInstance,
}

describe('libraryLoaded', () => {
  it('sets the library and path', () => {
    const result = libraryLoaded(initialState, populatedLibrary, '/path/to/lib')
    expect(result.library).toBe(populatedLibrary)
    expect(result.libraryPath).toBe('/path/to/lib')
  })
})

describe('libraryReloaded', () => {
  it('updates the library without changing the path', () => {
    const withLib = libraryLoaded(initialState, emptyLibrary, '/old/path')
    const result = libraryReloaded(withLib, populatedLibrary)
    expect(result.library).toBe(populatedLibrary)
    expect(result.libraryPath).toBe('/old/path')
  })
})

describe('instanceCreated', () => {
  it('sets the instance and clears project path', () => {
    const result = instanceCreated(initialState, testInstance)
    expect(result.currentInstance).toBe(testInstance)
    expect(result.currentProjectPath).toBeUndefined()
    expect(result.dirty).toBe(false)
  })

  it('resets selection and history', () => {
    const result = instanceCreated(initialState, testInstance)
    expect(result.selection).toStrictEqual({ kind: 'none' })
    expect(result.history.past).toHaveLength(0)
    expect(result.history.future).toHaveLength(0)
  })
})

describe('instanceLoaded', () => {
  it('sets the instance and project path', () => {
    const result = instanceLoaded(initialState, testInstance, '/saved/project.json')
    expect(result.currentInstance).toBe(testInstance)
    expect(result.currentProjectPath).toBe('/saved/project.json')
    expect(result.dirty).toBe(false)
  })
})

describe('instanceSaved', () => {
  it('sets the project path and clears dirty', () => {
    const dirtyState: AppState = { ...stateWithInstance, dirty: true }
    const result = instanceSaved(dirtyState, '/new/path.json')
    expect(result.currentProjectPath).toBe('/new/path.json')
    expect(result.dirty).toBe(false)
  })
})

describe('instanceRenamed', () => {
  it('renames the current instance and marks dirty', () => {
    const result = instanceRenamed(stateWithInstance, 'New Name')
    expect(result.currentInstance?.name).toBe('New Name')
    expect(result.dirty).toBe(true)
  })

  it('returns state unchanged when no instance exists', () => {
    const result = instanceRenamed(initialState, 'New Name')
    expect(result).toBe(initialState)
  })
})

describe('setSlotPart', () => {
  it('swaps the part and marks dirty', () => {
    const newPartId = partId('head_elf')
    const result = setSlotPart(stateWithInstance, headTag, newPartId)
    expect(result.currentInstance?.slots['head']?.partId.value).toBe('head_elf')
    expect(result.dirty).toBe(true)
  })

  it('returns state unchanged when no instance exists', () => {
    const result = setSlotPart(initialState, headTag, headPartId)
    expect(result).toBe(initialState)
  })
})

describe('setSlotOffset', () => {
  it('updates the offset and marks dirty', () => {
    const offset: Transform = { position: [0.1, 0.2, 0.3], rotation: [0, 0, 0], scale: 1 }
    const result = setSlotOffset(stateWithInstance, headTag, offset)
    expect(result.currentInstance?.slots['head']?.offset.position).toStrictEqual([0.1, 0.2, 0.3])
    expect(result.dirty).toBe(true)
  })

  it('returns state unchanged when no instance exists', () => {
    const offset: Transform = { position: [1, 2, 3], rotation: [0, 0, 0], scale: 1 }
    const result = setSlotOffset(initialState, headTag, offset)
    expect(result).toBe(initialState)
  })
})

describe('resetSlotOffset', () => {
  it('resets offset to identity and marks dirty', () => {
    const headSlot = testInstance.slots['head']
    if (headSlot === undefined) throw new Error('test setup: head slot missing')
    const withOffset: AppState = {
      ...stateWithInstance,
      currentInstance: {
        ...testInstance,
        slots: {
          head: {
            ...headSlot,
            offset: { position: [1, 2, 3], rotation: [0, 0, 0], scale: 2 },
          },
        },
      },
    }
    const result = resetSlotOffset(withOffset, headTag)
    expect(result.currentInstance?.slots['head']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
    expect(result.dirty).toBe(true)
  })
})

describe('setSlotTexture', () => {
  it('sets a texture and marks dirty', () => {
    const newTex = textureId('skin_dark')
    const result = setSlotTexture(stateWithInstance, headTag, 'diffuse', newTex)
    expect(result.currentInstance?.slots['head']?.textures['diffuse']?.value).toBe('skin_dark')
    expect(result.dirty).toBe(true)
  })

  it('removes a texture when undefined', () => {
    const result = setSlotTexture(stateWithInstance, headTag, 'diffuse', undefined)
    expect(result.currentInstance?.slots['head']?.textures['diffuse']).toBeUndefined()
  })
})

describe('savePartDefaultOffset', () => {
  it('updates the part default offset in the library', () => {
    const newOffset: Transform = { position: [0, 0.5, 0], rotation: [0, 0, 0], scale: 1 }
    const result = savePartDefaultOffset(stateWithInstance, headPartId, newOffset)
    expect(result.library.parts['head_male_base']?.defaultOffset).toStrictEqual(newOffset)
  })

  it('returns state unchanged for unknown part', () => {
    const newOffset: Transform = { position: [0, 1, 0], rotation: [0, 0, 0], scale: 1 }
    const result = savePartDefaultOffset(stateWithInstance, partId('nonexistent'), newOffset)
    expect(result).toBe(stateWithInstance)
  })
})

describe('setSelection', () => {
  it('sets the selection', () => {
    const result = setSelection(initialState, { kind: 'slot', slotTag: headTag })
    expect(result.selection).toStrictEqual({ kind: 'slot', slotTag: headTag })
  })

  it('clears selection to none', () => {
    const withSelection = setSelection(initialState, { kind: 'slot', slotTag: headTag })
    const result = setSelection(withSelection, { kind: 'none' })
    expect(result.selection).toStrictEqual({ kind: 'none' })
  })
})

describe('setToolMode', () => {
  it('sets the tool mode', () => {
    const result = setToolMode(initialState, 'rotate')
    expect(result.toolMode).toBe('rotate')
  })
})

describe('toggleViewOption', () => {
  it('toggles showGrid', () => {
    const result = toggleViewOption(initialState, 'showGrid')
    expect(result.viewOptions.showGrid).toBe(false)
    const result2 = toggleViewOption(result, 'showGrid')
    expect(result2.viewOptions.showGrid).toBe(true)
  })

  it('toggles wireframe', () => {
    const result = toggleViewOption(initialState, 'wireframe')
    expect(result.viewOptions.wireframe).toBe(true)
  })
})

describe('setEditorOption', () => {
  it('sets a single option', () => {
    const result = setEditorOption(initialState, { snapEnabled: true })
    expect(result.editorOptions.snapEnabled).toBe(true)
    expect(result.editorOptions.snapTranslation).toBe(0.05)
  })

  it('sets multiple options at once', () => {
    const result = setEditorOption(initialState, { snapEnabled: true, snapTranslation: 0.1 })
    expect(result.editorOptions.snapEnabled).toBe(true)
    expect(result.editorOptions.snapTranslation).toBe(0.1)
  })
})

describe('undo', () => {
  it('returns state unchanged when history is empty', () => {
    const result = undo(initialState)
    expect(result).toBe(initialState)
  })

  it('restores previous state from history', () => {
    const stateWithHistory: AppState = {
      ...stateWithInstance,
      dirty: true,
      history: {
        ...initialState.history,
        past: [
          {
            label: 'swap part',
            previousState: { currentInstance: testInstance, dirty: false },
          },
        ],
        future: [],
      },
    }
    const result = undo(stateWithHistory)
    expect(result.currentInstance).toBe(testInstance)
    expect(result.dirty).toBe(false)
    expect(result.history.past).toHaveLength(0)
    expect(result.history.future).toHaveLength(1)
  })
})

describe('redo', () => {
  it('returns state unchanged when future is empty', () => {
    const result = redo(initialState)
    expect(result).toBe(initialState)
  })

  it('restores next state from future', () => {
    const modifiedInstance: AssetInstance = { ...testInstance, name: 'Modified' }
    const stateWithFuture: AppState = {
      ...stateWithInstance,
      history: {
        ...initialState.history,
        past: [],
        future: [
          {
            label: 'swap part',
            previousState: { currentInstance: modifiedInstance, dirty: true },
          },
        ],
      },
    }
    const result = redo(stateWithFuture)
    expect(result.currentInstance?.name).toBe('Modified')
    expect(result.dirty).toBe(true)
    expect(result.history.future).toHaveLength(0)
    expect(result.history.past).toHaveLength(1)
  })
})
