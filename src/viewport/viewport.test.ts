/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import type { FsAdapter } from '../shell/fs/adapter'
import { createAppStore } from '../store/store'
import { createViewport } from './viewport'

const mockAdapter: FsAdapter = {
  pickFolder: () => Promise.resolve(undefined),
  pickFile: () => Promise.resolve(undefined),
  readTextFile: () => Promise.resolve('{}'),
  writeTextFile: () => Promise.resolve(),
  readBinaryFile: () => Promise.resolve(new Uint8Array()),
  writeBinaryFile: () => Promise.resolve(),
  listFiles: () => Promise.resolve([]),
  watchFolder: () => () => undefined,
}

describe('createViewport', () => {
  it('creates a viewport with mount, unmount, and dispose', () => {
    const store = createAppStore()
    const viewport = createViewport(store, mockAdapter)

    expect(viewport.mount).toBeDefined()
    expect(viewport.unmount).toBeDefined()
    expect(viewport.dispose).toBeDefined()
  })

  it('can be disposed without mounting', () => {
    const store = createAppStore()
    const viewport = createViewport(store, mockAdapter)

    expect(() => {
      viewport.dispose()
    }).not.toThrow()
  })

  it('unmount is safe to call multiple times', () => {
    const store = createAppStore()
    const viewport = createViewport(store, mockAdapter)

    expect(() => {
      viewport.unmount()
      viewport.unmount()
    }).not.toThrow()
  })
})
