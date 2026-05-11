import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import type { FsAdapter } from './adapter'

export const createTauriAdapter = (): FsAdapter => ({
  pickFolder: async () => {
    const selected = await open({ directory: true, multiple: false })
    if (selected === null) return undefined
    if (Array.isArray(selected)) {
      const first: unknown = selected[0]
      return typeof first === 'string' ? first : undefined
    }
    return selected
  },

  readTextFile: (path) => invoke<string>('read_text_file', { path }),

  writeTextFile: async (path, content) => {
    await invoke('write_text_file', { path, content })
  },

  readBinaryFile: async (path) => {
    const data = await invoke<number[]>('read_binary_file', { path })
    return new Uint8Array(data)
  },

  writeBinaryFile: async (path, content) => {
    await invoke('write_binary_file', { path, content: Array.from(content) })
  },

  listFiles: (path) => invoke<string[]>('list_files', { path }),

  watchFolder: () => {
    return () => undefined
  },
})
