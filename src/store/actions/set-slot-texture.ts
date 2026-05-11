import type { SlotTag, TextureId } from '../../schema/ids'
import type { TextureChannel } from '../../schema/part'
import { setSlotTexture as coreSetSlotTexture } from '../../core/slots'
import type { AppState } from '../state'

export const setSlotTexture = (
  state: AppState,
  slotTagValue: SlotTag,
  channel: TextureChannel,
  newTextureId: TextureId | undefined,
): AppState => {
  if (state.currentInstance === undefined) return state
  return {
    ...state,
    currentInstance: coreSetSlotTexture(state.currentInstance, slotTagValue, channel, newTextureId),
    dirty: true,
  }
}
