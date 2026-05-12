import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  textureId,
  assetInstanceId,
} from '../../schema/ids'
import type { AssetInstance } from '../../schema/instance'
import type { Part } from '../../schema/part'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import { emptyLibrary } from '../../schema/library'
import type { AppState } from '../state'
import { initialState } from '../state'
import { selectSelectedSlotTag } from './select-selected-slot-tag'
import { selectCurrentSlot } from './select-current-slot'
import { selectAvailablePartsForSelection } from './select-available-parts-for-selection'
import { selectCanUndo } from './select-can-undo'
import { selectCanRedo } from './select-can-redo'

const headTag = slotTag('head')
const torsoTag = slotTag('torso')
const headPartId = partId('head_male_base')
const headElfPartId = partId('head_elf')
const skinTextureId = textureId('skin_pale')

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

const testInstance: AssetInstance = {
  id: assetInstanceId('test'),
  name: 'Test',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: {
      partId: headPartId,
      offset: { position: [0, 0.1, 0], rotation: [0, 0, 0], scale: 1 },
      textures: { diffuse: skinTextureId },
    },
  },
}

const stateWithSelection: AppState = {
  ...initialState,
  library: {
    ...emptyLibrary,
    parts: {
      [headPartId.value]: headPart,
      [headElfPartId.value]: headElfPart,
    },
    partsByTag: {
      [headTag.value]: [headPartId, headElfPartId],
    },
  },
  currentInstance: testInstance,
  selection: { kind: 'slot', slotTag: headTag },
}

describe('selectSelectedSlotTag', () => {
  it('returns the slot tag when a slot is selected', () => {
    const result = selectSelectedSlotTag(stateWithSelection)
    expect(result?.value).toBe('head')
  })

  it('returns undefined when nothing is selected', () => {
    expect(selectSelectedSlotTag(initialState)).toBeUndefined()
  })
})

describe('selectCurrentSlot', () => {
  it('returns the slot assignment for the selected slot', () => {
    const result = selectCurrentSlot(stateWithSelection)
    expect(result).toBeDefined()
    expect(result?.partId.value).toBe('head_male_base')
    expect(result?.offset.position).toStrictEqual([0, 0.1, 0])
  })

  it('returns undefined when nothing is selected', () => {
    expect(selectCurrentSlot(initialState)).toBeUndefined()
  })

  it('returns undefined when no instance exists', () => {
    const noInstance: AppState = {
      ...stateWithSelection,
      currentInstance: undefined,
    }
    expect(selectCurrentSlot(noInstance)).toBeUndefined()
  })

  it('returns undefined when selected slot has no assignment', () => {
    const withTorsoSelected: AppState = {
      ...stateWithSelection,
      selection: { kind: 'slot', slotTag: torsoTag },
    }
    expect(selectCurrentSlot(withTorsoSelected)).toBeUndefined()
  })
})

describe('selectAvailablePartsForSelection', () => {
  it('returns parts matching the selected slot tag', () => {
    const result = selectAvailablePartsForSelection(stateWithSelection)
    expect(result).toHaveLength(2)
    expect(result.map((p) => p.id.value).sort()).toStrictEqual(['head_elf', 'head_male_base'])
  })

  it('returns empty when nothing is selected', () => {
    expect(selectAvailablePartsForSelection(initialState)).toHaveLength(0)
  })

  it('returns empty when selected tag has no parts', () => {
    const withTorsoSelected: AppState = {
      ...stateWithSelection,
      selection: { kind: 'slot', slotTag: torsoTag },
    }
    expect(selectAvailablePartsForSelection(withTorsoSelected)).toHaveLength(0)
  })
})

describe('selectCanUndo', () => {
  it('returns false when history is empty', () => {
    expect(selectCanUndo(initialState)).toBe(false)
  })

  it('returns true when history has past entries', () => {
    const withHistory: AppState = {
      ...initialState,
      history: {
        ...initialState.history,
        past: [{ label: 'test', previousState: { currentInstance: undefined, dirty: false } }],
      },
    }
    expect(selectCanUndo(withHistory)).toBe(true)
  })
})

describe('selectCanRedo', () => {
  it('returns false when future is empty', () => {
    expect(selectCanRedo(initialState)).toBe(false)
  })

  it('returns true when history has future entries', () => {
    const withFuture: AppState = {
      ...initialState,
      history: {
        ...initialState.history,
        future: [{ label: 'test', previousState: { currentInstance: undefined, dirty: false } }],
      },
    }
    expect(selectCanRedo(withFuture)).toBe(true)
  })
})
