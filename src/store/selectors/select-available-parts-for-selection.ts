import type { Part } from '../../schema/part'
import { filterPartsByTag } from '../../core/library-index'
import type { AppState } from '../state'

export const selectAvailablePartsForSelection = (state: AppState): readonly Part[] => {
  if (state.selection.kind !== 'slot') return []
  return filterPartsByTag(state.library, state.selection.slotTag)
}
