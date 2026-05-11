import type { SlotTag } from '../../schema/ids'
import type { Transform } from '../../schema/transform'
import { setSlotOffset as coreSetSlotOffset } from '../../core/slots'
import type { AppState } from '../state'

export const setSlotOffset = (
  state: AppState,
  slotTagValue: SlotTag,
  offset: Transform,
): AppState => {
  if (state.currentInstance === undefined) return state
  return {
    ...state,
    currentInstance: coreSetSlotOffset(state.currentInstance, slotTagValue, offset),
    dirty: true,
  }
}
