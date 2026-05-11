import type { PartId } from '../../schema/ids'
import type { Transform } from '../../schema/transform'
import type { AppState } from '../state'

export const savePartDefaultOffset = (
  state: AppState,
  targetPartId: PartId,
  offset: Transform,
): AppState => {
  const existingPart = state.library.parts[targetPartId.value]
  if (existingPart === undefined) return state

  return {
    ...state,
    library: {
      ...state.library,
      parts: {
        ...state.library.parts,
        [targetPartId.value]: { ...existingPart, defaultOffset: offset },
      },
    },
  }
}
