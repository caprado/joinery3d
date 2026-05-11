/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { render } from 'preact'
import { App } from './app'

describe('App', () => {
  it('renders the top-level layout', () => {
    const container = document.createElement('div')
    render(<App />, container)

    expect(container.querySelector('.app')).not.toBeNull()
    expect(container.querySelector('.app-topbar')).not.toBeNull()
    expect(container.querySelector('.app-main')).not.toBeNull()
    expect(container.querySelector('.app-sidebar-left')).not.toBeNull()
    expect(container.querySelector('.app-viewport')).not.toBeNull()
    expect(container.querySelector('.app-sidebar-right')).not.toBeNull()
  })

  it('displays the app name in the topbar', () => {
    const container = document.createElement('div')
    render(<App />, container)

    const topbar = container.querySelector('.app-topbar')
    expect(topbar?.textContent).toContain('Joinery3D')
  })
})
