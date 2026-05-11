import type { SlotAssignment } from '../../schema/instance'
import type { AppState } from '../state'

export const selectCurrentSlot = (state: AppState): SlotAssignment | undefined => {
  if (state.selection.kind !== 'slot') return undefined
  if (state.currentInstance === undefined) return undefined
  return state.currentInstance.slots[state.selection.slotTag.value]
}
