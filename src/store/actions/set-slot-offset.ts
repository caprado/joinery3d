import type { SlotTag } from '../../schema/ids'
import type { Transform } from '../../schema/transform'
import { mirrorXTransform } from '../../schema/transform'
import { setSlotOffset as coreSetSlotOffset, resolvePairedSlot } from '../../core/slots'
import { applySnap } from '../../core/transforms'
import { findTemplate } from '../../schema/library'
import type { AppState } from '../state'

const maybeSnap = (state: AppState, offset: Transform): Transform => {
  if (!state.editorOptions.snapEnabled) return offset
  return applySnap(
    offset,
    state.editorOptions.snapTranslation,
    state.editorOptions.snapRotation,
    state.editorOptions.snapScale,
  )
}

export const setSlotOffset = (
  state: AppState,
  slotTagValue: SlotTag,
  offset: Transform,
): AppState => {
  if (state.currentInstance === undefined) return state

  const snappedOffset = maybeSnap(state, offset)
  const updated = coreSetSlotOffset(state.currentInstance, slotTagValue, snappedOffset)

  if (!state.editorOptions.mirrorEnabled) {
    return { ...state, currentInstance: updated, dirty: true }
  }

  const template = findTemplate(state.library, state.currentInstance.templateId)
  if (template === undefined) {
    return { ...state, currentInstance: updated, dirty: true }
  }

  const pairedTag = resolvePairedSlot(template, slotTagValue)
  if (pairedTag === undefined) {
    return { ...state, currentInstance: updated, dirty: true }
  }

  const mirroredOffset = mirrorXTransform(snappedOffset)
  const withMirror = coreSetSlotOffset(updated, pairedTag, mirroredOffset)

  return { ...state, currentInstance: withMirror, dirty: true }
}
