import { slotTag } from '../../schema/ids'
import type { PartId } from '../../schema/ids'
import type { AppState } from '../state'

export type PartMetadataUpdate = {
  readonly name?: string
  readonly tags?: readonly string[]
}

export const updatePartMetadata = (
  state: AppState,
  targetPartId: PartId,
  update: PartMetadataUpdate,
): AppState => {
  const existingPart = state.library.parts[targetPartId.value]
  if (existingPart === undefined) return state

  const updatedPart = {
    ...existingPart,
    ...(update.name !== undefined ? { name: update.name } : {}),
    ...(update.tags !== undefined ? { tags: update.tags.map((tag) => slotTag(tag)) } : {}),
  }

  const updatedParts = { ...state.library.parts, [targetPartId.value]: updatedPart }

  const updatedPartsByTag = Object.values(updatedParts).reduce<
    Record<string, readonly PartId[]>
  >((acc, part) =>
    part.tags.reduce<Record<string, readonly PartId[]>>((innerAcc, tag) => {
      const existing = innerAcc[tag.value] ?? []
      const alreadyPresent = existing.some((id) => id.value === part.id.value)
      return alreadyPresent ? innerAcc : { ...innerAcc, [tag.value]: [...existing, part.id] }
    }, acc),
  {})

  return {
    ...state,
    library: {
      ...state.library,
      parts: updatedParts,
      partsByTag: updatedPartsByTag,
    },
  }
}
