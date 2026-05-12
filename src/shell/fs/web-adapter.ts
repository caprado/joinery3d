import type { FsAdapter } from './adapter'

type FileSystemDirectoryHandle = {
  readonly kind: 'directory'
  readonly name: string
  values: () => AsyncIterableIterator<FileSystemHandleEntry>
  getFileHandle: (name: string) => Promise<FileSystemFileHandle>
  getDirectoryHandle: (name: string) => Promise<FileSystemDirectoryHandle>
}

type FileSystemFileHandle = {
  readonly kind: 'file'
  readonly name: string
  getFile: () => Promise<File>
  createWritable: () => Promise<FileSystemWritableFileStream>
}

type FileSystemHandleEntry = FileSystemDirectoryHandle | FileSystemFileHandle

type FileSystemWritableFileStream = {
  write: (data: string | Uint8Array) => Promise<void>
  close: () => Promise<void>
}

interface WindowWithFsAccess {
  showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>
}

const hasFsAccess = (win: unknown): win is WindowWithFsAccess => {
  if (typeof win !== 'object' || win === null) return false
  if (!('showDirectoryPicker' in win)) return false
  return typeof win.showDirectoryPicker === 'function'
}

const resolveHandle = async (
  rootHandle: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemFileHandle> => {
  const segments = path.split('/').filter((segment) => segment.length > 0)
  const fileName = segments[segments.length - 1]
  if (fileName === undefined) throw new Error(`Invalid path: ${path}`)

  const dirSegments = segments.slice(0, -1)
  const directory = await dirSegments.reduce<Promise<FileSystemDirectoryHandle>>(
    async (acc, segment) => {
      const dir = await acc
      return dir.getDirectoryHandle(segment)
    },
    Promise.resolve(rootHandle),
  )

  return directory.getFileHandle(fileName)
}

const collectFiles = async (
  handle: FileSystemDirectoryHandle,
  prefix: string,
): Promise<readonly string[]> => {
  const entries: string[] = []
  for await (const entry of handle.values()) {
    const entryPath = prefix.length > 0 ? `${prefix}/${entry.name}` : entry.name
    if (entry.kind === 'file') {
      entries.push(entryPath)
    } else {
      const subResults = await collectFiles(entry, entryPath)
      entries.push(...subResults)
    }
  }
  return entries
}

export const createWebAdapter = (): FsAdapter => {
  const directoryHandles = new Map<string, FileSystemDirectoryHandle>()

  const getRoot = (path: string): { handle: FileSystemDirectoryHandle; relativePath: string } => {
    for (const [rootPath, handle] of directoryHandles.entries()) {
      if (path.startsWith(rootPath)) {
        const relativePath = path.slice(rootPath.length).replace(/^\//, '')
        return { handle, relativePath }
      }
    }
    throw new Error(`No directory handle registered for path: ${path}`)
  }

  return {
    pickFolder: async () => {
      if (!hasFsAccess(window)) return undefined
      try {
        const handle = await window.showDirectoryPicker()
        const path = `/${handle.name}`
        directoryHandles.set(path, handle)
        return path
      } catch {
        return undefined
      }
    },

    readTextFile: async (path) => {
      const { handle, relativePath } = getRoot(path)
      const fileHandle = await resolveHandle(handle, relativePath)
      const file = await fileHandle.getFile()
      return file.text()
    },

    writeTextFile: async (path, content) => {
      const { handle, relativePath } = getRoot(path)
      const fileHandle = await resolveHandle(handle, relativePath)
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
    },

    readBinaryFile: async (path) => {
      const { handle, relativePath } = getRoot(path)
      const fileHandle = await resolveHandle(handle, relativePath)
      const file = await fileHandle.getFile()
      const buffer = await file.arrayBuffer()
      return new Uint8Array(buffer)
    },

    writeBinaryFile: async (path, content) => {
      const { handle, relativePath } = getRoot(path)
      const fileHandle = await resolveHandle(handle, relativePath)
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
    },

    listFiles: async (path) => {
      const { handle, relativePath } = getRoot(path)
      if (relativePath.length === 0) {
        return collectFiles(handle, '')
      }
      const segments = relativePath.split('/').filter((segment) => segment.length > 0)
      const subDir = await segments.reduce<Promise<FileSystemDirectoryHandle>>(
        async (acc, segment) => {
          const dir = await acc
          return dir.getDirectoryHandle(segment)
        },
        Promise.resolve(handle),
      )
      return collectFiles(subDir, '')
    },

    watchFolder: () => {
      return () => undefined
    },
  }
}
