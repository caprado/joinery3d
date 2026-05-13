/**
 * Integration test: verify all features are actually wired and functional.
 *
 * This test exercises the store actions and selectors that the UI components
 * call, proving the full data flow works end-to-end.
 */
import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  textureId,
} from '../schema/ids'
import type { Part } from '../schema/part'
import type { Template } from '../schema/template'
import type { Texture } from '../schema/texture'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { buildIndexFromParts } from '../core/library-index'
import { createInstanceFromTemplate } from '../core/create-instance'
import { buildRenderDescription } from '../core/assembly'
import { createAppStore } from '../store/store'
import { selectSelectedSlotTag } from '../store/selectors/select-selected-slot-tag'
import { selectCurrentSlot } from '../store/selectors/select-current-slot'
import { selectAvailablePartsForSelection } from '../store/selectors/select-available-parts-for-selection'
import { selectCanUndo } from '../store/selectors/select-can-undo'
import { selectCanRedo } from '../store/selectors/select-can-redo'

const headTag = slotTag('head')
const torsoTag = slotTag('torso')
const leftArmTag = slotTag('left_arm')
const rightArmTag = slotTag('right_arm')

const headMaleId = partId('head_male_base')
const headElfId = partId('head_elf')
const torsoMaleId = partId('torso_male_base')
const armLeftId = partId('arm_left')
const armRightId = partId('arm_right')
const skinPaleId = textureId('skin_pale')
const skinDarkId = textureId('skin_dark')

const headMale: Part = {
  id: headMaleId, name: 'Male Head', tags: [headTag],
  meshFile: 'parts/head/head_male_base.glb', defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [{ channel: 'diffuse', defaultTextureId: skinPaleId, variants: [] }],
  thumbnailFile: undefined,
}

const headElf: Part = {
  id: headElfId, name: 'Elf Head', tags: [headTag],
  meshFile: 'parts/head/head_elf.glb',
  defaultOffset: { position: [0, 0.02, 0], rotation: [0, 0, 0], scale: 1 },
  textureSlots: [{ channel: 'diffuse', defaultTextureId: skinPaleId, variants: [] }],
  thumbnailFile: undefined,
}

const torsoMale: Part = {
  id: torsoMaleId, name: 'Male Torso', tags: [torsoTag],
  meshFile: 'parts/torso/torso_male_base.glb', defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [], thumbnailFile: undefined,
}

const armLeft: Part = {
  id: armLeftId, name: 'Left Arm', tags: [leftArmTag],
  meshFile: 'parts/left_arm/arm.glb', defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [], thumbnailFile: undefined,
}

const armRight: Part = {
  id: armRightId, name: 'Right Arm', tags: [rightArmTag],
  meshFile: 'parts/right_arm/arm.glb', defaultOffset: IDENTITY_TRANSFORM,
  textureSlots: [], thumbnailFile: undefined,
}

const skinPale: Texture = {
  id: skinPaleId, name: 'Pale Skin', file: 'textures/skin_pale.png',
  width: 64, height: 64, tags: ['skin'],
}

const skinDark: Texture = {
  id: skinDarkId, name: 'Dark Skin', file: 'textures/skin_dark.png',
  width: 64, height: 64, tags: ['skin'],
}

const humanoidTemplate: Template = {
  id: templateId('humanoid'), name: 'Humanoid', description: 'Biped', version: 1,
  slots: [
    { tag: headTag, name: 'Head', anchor: { position: [0, 1.6, 0], rotation: [0, 0, 0], scale: 1 }, defaultPartId: headMaleId, pairedSlot: undefined, required: true },
    { tag: torsoTag, name: 'Torso', anchor: { position: [0, 1.0, 0], rotation: [0, 0, 0], scale: 1 }, defaultPartId: torsoMaleId, pairedSlot: undefined, required: true },
    { tag: leftArmTag, name: 'Left Arm', anchor: IDENTITY_TRANSFORM, defaultPartId: armLeftId, pairedSlot: rightArmTag, required: true },
    { tag: rightArmTag, name: 'Right Arm', anchor: IDENTITY_TRANSFORM, defaultPartId: armRightId, pairedSlot: leftArmTag, required: true },
  ],
}

const library = buildIndexFromParts(
  [humanoidTemplate],
  [headMale, headElf, torsoMale, armLeft, armRight],
  [skinPale, skinDark],
)

describe('Feature wiring integration', () => {
  it('full workflow: load library, create instance, select, swap, adjust, texture, undo, redo', () => {
    const store = createAppStore()

    // 1. Load library
    store.getState().libraryLoaded(library, '/lib')
    expect(Object.keys(store.getState().library.parts)).toHaveLength(5)

    // 2. Create instance from template
    const instance = createInstanceFromTemplate(humanoidTemplate, 'Test Humanoid')
    store.getState().instanceCreated(instance)
    expect(store.getState().currentInstance?.name).toBe('Test Humanoid')

    // 3. Select a slot
    store.getState().setSelection({ kind: 'slot', slotTag: headTag })
    expect(selectSelectedSlotTag(store.getState())?.value).toBe('head')
    expect(selectCurrentSlot(store.getState())?.partId.value).toBe('head_male_base')

    // 4. Available parts filter by tag
    const headParts = selectAvailablePartsForSelection(store.getState())
    expect(headParts).toHaveLength(2)

    // 5. Swap part
    store.getState().setSlotPart(headTag, headElfId)
    expect(store.getState().currentInstance?.slots['head']?.partId.value).toBe('head_elf')
    expect(store.getState().dirty).toBe(true)

    // 6. Adjust offset
    store.getState().setSlotOffset(headTag, { position: [0, 0.05, 0], rotation: [0, 0, 0], scale: 1 })
    expect(store.getState().currentInstance?.slots['head']?.offset.position[1]).toBeCloseTo(0.05)

    // 7. Set texture
    store.getState().setSlotTexture(headTag, 'diffuse', skinDarkId)
    expect(store.getState().currentInstance?.slots['head']?.textures['diffuse']?.value).toBe('skin_dark')

    // 8. Undo texture change — reverts to state before setSlotTexture (empty textures from swap)
    store.getState().undo()
    expect(store.getState().currentInstance?.slots['head']?.textures['diffuse']).toBeUndefined()
    expect(selectCanUndo(store.getState())).toBe(true)
    expect(selectCanRedo(store.getState())).toBe(true)

    // 9. Redo
    store.getState().redo()
    expect(store.getState().currentInstance?.slots['head']?.textures['diffuse']?.value).toBe('skin_dark')

    // 10. Reset offset
    store.getState().resetSlotOffset(headTag)
    expect(store.getState().currentInstance?.slots['head']?.offset).toStrictEqual(IDENTITY_TRANSFORM)

    // 11. Tool mode changes
    store.getState().setToolMode('rotate')
    expect(store.getState().toolMode).toBe('rotate')

    // 12. View options toggle
    store.getState().toggleViewOption('wireframe')
    expect(store.getState().viewOptions.wireframe).toBe(true)
    store.getState().toggleViewOption('ps1Effects')
    expect(store.getState().viewOptions.ps1Effects).toBe(true)
    store.getState().toggleViewOption('showGrid')
    expect(store.getState().viewOptions.showGrid).toBe(false)

    // 13. Editor options
    store.getState().setEditorOption({ snapEnabled: true })
    expect(store.getState().editorOptions.snapEnabled).toBe(true)
    store.getState().setEditorOption({ mirrorEnabled: true })
    expect(store.getState().editorOptions.mirrorEnabled).toBe(true)

    // 14. Snap works
    store.getState().setSlotOffset(headTag, { position: [0.07, 0.12, 0.23], rotation: [0, 0, 0], scale: 1 })
    const snappedPos = store.getState().currentInstance?.slots['head']?.offset.position
    expect(snappedPos?.[0]).toBeCloseTo(0.05)
    expect(snappedPos?.[1]).toBeCloseTo(0.10)
    expect(snappedPos?.[2]).toBeCloseTo(0.25)

    // 15. Mirror works (left arm → right arm mirrors)
    // Note: snap is enabled, so values get rounded to snap increments first
    store.getState().setSelection({ kind: 'slot', slotTag: leftArmTag })
    store.getState().setSlotOffset(leftArmTag, { position: [0.5, 0, 0], rotation: [0, 0.1, 0], scale: 1 })
    const rightOffset = store.getState().currentInstance?.slots['right_arm']?.offset
    expect(rightOffset?.position[0]).toBeCloseTo(-0.5)
    // Rotation 0.1 snaps to 0.0872665 (1 snap increment), then mirrors to negative
    expect(rightOffset?.rotation[1]).toBeCloseTo(-0.0872665)

    // 16. Save part default offset
    store.getState().savePartDefaultOffset(headElfId, { position: [0, 0.1, 0], rotation: [0, 0, 0], scale: 1 })
    expect(store.getState().library.parts['head_elf']?.defaultOffset.position[1]).toBeCloseTo(0.1)

    // 17. Update part metadata
    store.getState().updatePartMetadata(headMaleId, { name: 'Renamed Head' })
    expect(store.getState().library.parts['head_male_base']?.name).toBe('Renamed Head')

    // 18. Instance rename
    store.getState().instanceRenamed('Custom Elf Warrior')
    expect(store.getState().currentInstance?.name).toBe('Custom Elf Warrior')

    // 19. Build render description works
    const state = store.getState()
    if (state.currentInstance === undefined) throw new Error('expected instance')
    const renderDesc = buildRenderDescription(
      state.currentInstance,
      humanoidTemplate,
      state.library,
    )
    expect(renderDesc.nodes.length).toBeGreaterThan(0)

    // 20. Save marks clean
    store.getState().instanceSaved('/projects/test.json')
    expect(store.getState().dirty).toBe(false)
    expect(store.getState().currentProjectPath).toBe('/projects/test.json')
    expect(store.getState().recentProjects).toContain('/projects/test.json')

    // 21. Selection changes are NOT undoable
    const historyLengthBefore = store.getState().history.past.length
    store.getState().setSelection({ kind: 'slot', slotTag: torsoTag })
    expect(store.getState().history.past.length).toBe(historyLengthBefore)
  })
})
