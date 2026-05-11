/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { WelcomeScreen } from './welcome-screen'

describe('WelcomeScreen', () => {
  it('renders the app title and subtitle', () => {
    const container = document.createElement('div')
    render(
      <WelcomeScreen onOpenLibrary={() => undefined} onUseSampleLibrary={() => undefined} />,
      container,
    )
    expect(container.textContent).toContain('Joinery3D')
    expect(container.textContent).toContain('modular 3D asset assembler')
  })

  it('renders both action buttons', () => {
    const container = document.createElement('div')
    render(
      <WelcomeScreen onOpenLibrary={() => undefined} onUseSampleLibrary={() => undefined} />,
      container,
    )
    expect(container.textContent).toContain('Open Library Folder')
    expect(container.textContent).toContain('Use Sample Library')
  })

  it('calls onOpenLibrary when Open Library Folder is clicked', () => {
    const onOpenLibrary = vi.fn()
    const container = document.createElement('div')
    render(
      <WelcomeScreen onOpenLibrary={onOpenLibrary} onUseSampleLibrary={() => undefined} />,
      container,
    )
    const button = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Open Library Folder',
    )
    button?.click()
    expect(onOpenLibrary).toHaveBeenCalledOnce()
  })

  it('calls onUseSampleLibrary when Use Sample Library is clicked', () => {
    const onUseSampleLibrary = vi.fn()
    const container = document.createElement('div')
    render(
      <WelcomeScreen onOpenLibrary={() => undefined} onUseSampleLibrary={onUseSampleLibrary} />,
      container,
    )
    const button = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Use Sample Library',
    )
    button?.click()
    expect(onUseSampleLibrary).toHaveBeenCalledOnce()
  })
})
