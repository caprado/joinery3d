/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render } from 'preact'
import { createAppStore } from '../store/store'
import type { FsAdapter } from '../shell/fs/adapter'
import { App } from './app'

const mockAdapter: FsAdapter = {
  pickFolder: () => Promise.resolve(undefined),
  pickFile: () => Promise.resolve(undefined),
  readTextFile: () => Promise.resolve(''),
  writeTextFile: () => Promise.resolve(),
  readBinaryFile: () => Promise.resolve(new Uint8Array()),
  writeBinaryFile: () => Promise.resolve(),
  listFiles: () => Promise.resolve([]),
  watchFolder: () => () => undefined,
}

describe('App', () => {
  it('renders the welcome screen when no library is loaded', () => {
    const store = createAppStore()
    const container = document.createElement('div')
    render(
      <App
        store={store}
        adapter={mockAdapter}
      />,
      container,
    )

    expect(container.textContent).toContain('Joinery3D')
    expect(container.querySelector('.welcome-screen')).not.toBeNull()
  })

  it('renders the welcome screen actions', () => {
    const store = createAppStore()
    const container = document.createElement('div')
    render(
      <App
        store={store}
        adapter={mockAdapter}
      />,
      container,
    )

    expect(container.textContent).toContain('Open Library Folder')
    expect(container.textContent).toContain('Use Sample Library')
  })
})
