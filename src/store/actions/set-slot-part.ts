import type { PartId, SlotTag } from '../../schema/ids'
import { setSlotPart as coreSetSlotPart } from '../../core/slots'
import type { AppState } from '../state'

export const setSlotPart = (state: AppState, slotTagValue: SlotTag, partIdValue: PartId): AppState => {
  if (state.currentInstance === undefined) return state
  return {
    ...state,
    currentInstance: coreSetSlotPart(state.currentInstance, slotTagValue, partIdValue),
    dirty: true,
  }
}
