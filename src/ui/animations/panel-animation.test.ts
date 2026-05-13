/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { animatePanelSlideIn, animateDrawerOpen } from './panel-animation'

const createAttachedElement = (): HTMLElement => {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return element
}

describe('animatePanelSlideIn', () => {
  it('does not throw for left direction', () => {
    const element = createAttachedElement()
    expect(() => {
      animatePanelSlideIn(element, 'left')
    }).not.toThrow()
  })

  it('does not throw for right direction', () => {
    const element = createAttachedElement()
    expect(() => {
      animatePanelSlideIn(element, 'right')
    }).not.toThrow()
  })
})

describe('animateDrawerOpen', () => {
  it('does not throw', () => {
    const element = createAttachedElement()
    expect(() => {
      animateDrawerOpen(element)
    }).not.toThrow()
  })
})
