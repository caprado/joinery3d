import type { SlotTag } from '../../schema/ids'
import type { AppState } from '../state'

export const selectSelectedSlotTag = (state: AppState): SlotTag | undefined =>
  state.selection.kind === 'slot' ? state.selection.slotTag : undefined
