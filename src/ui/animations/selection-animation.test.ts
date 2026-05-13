/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { animateSelectionHighlight, animatePartSwap } from './selection-animation'

const createAttachedElement = (): HTMLElement => {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return element
}

describe('animateSelectionHighlight', () => {
  it('does not throw', () => {
    const element = createAttachedElement()
    expect(() => {
      animateSelectionHighlight(element)
    }).not.toThrow()
  })
})

describe('animatePartSwap', () => {
  it('does not throw', () => {
    const element = createAttachedElement()
    expect(() => {
      animatePartSwap(element)
    }).not.toThrow()
  })
})
