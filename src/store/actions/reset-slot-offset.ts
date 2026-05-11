import type { SlotTag } from '../../schema/ids'
import { resetSlotOffset as coreResetSlotOffset } from '../../core/slots'
import type { AppState } from '../state'

export const resetSlotOffset = (state: AppState, slotTagValue: SlotTag): AppState => {
  if (state.currentInstance === undefined) return state
  return {
    ...state,
    currentInstance: coreResetSlotOffset(state.currentInstance, slotTagValue),
    dirty: true,
  }
}
