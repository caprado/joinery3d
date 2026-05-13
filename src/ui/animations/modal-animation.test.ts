/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { animateModalIn, animateModalOut } from './modal-animation'

const createAttachedElement = (): HTMLElement => {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return element
}

describe('animateModalIn', () => {
  it('does not throw when elements are in the DOM', () => {
    const overlay = createAttachedElement()
    const content = createAttachedElement()
    expect(() => {
      animateModalIn(overlay, content)
    }).not.toThrow()
  })
})

describe('animateModalOut', () => {
  it('calls onComplete', async () => {
    const overlay = createAttachedElement()
    const content = createAttachedElement()

    await new Promise<void>((resolve) => {
      animateModalOut(overlay, content, () => {
        resolve()
      })
    })
  })
})
