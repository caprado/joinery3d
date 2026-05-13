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

  pickFile: async (extensions) => {
    const selected = await open({
      directory: false,
      multiple: false,
      filters: [{ name: 'Files', extensions: [...extensions] }],
    })
    if (selected === null) return undefined
    if (Array.isArray(selected)) {
      const first: unknown = selected[0]
      return typeof first === 'string' ? first : undefined
    }
    return selected
  },

  readTextFile: async (path) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const response = await fetch(path)
      return response.text()
    }
    return invoke<string>('read_text_file', { path })
  },

  writeTextFile: async (path, content) => {
    await invoke('write_text_file', { path, content })
  },

  readBinaryFile: async (path) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const response = await fetch(path)
      const buffer = await response.arrayBuffer()
      return new Uint8Array(buffer)
    }
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
