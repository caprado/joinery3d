import type { FsAdapter } from './adapter'
import { createTauriAdapter } from './tauri-adapter'
import { createWebAdapter } from './web-adapter'

const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export const createFsAdapter = (): FsAdapter => {
  if (isTauri()) {
    return createTauriAdapter()
  }
  return createWebAdapter()
}
