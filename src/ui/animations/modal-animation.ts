import { safeAnimate } from './safe-animate'

export const animateModalIn = (overlay: Element, content: Element): void => {
  void safeAnimate(overlay, { opacity: [0, 1] }, { duration: 0.2 })
  void safeAnimate(
    content,
    { opacity: [0, 1], transform: ['scale(0.95)', 'scale(1)'] },
    { duration: 0.2, easing: 'ease-out' },
  )
}

export const animateModalOut = (
  overlay: Element,
  content: Element,
  onComplete: () => void,
): void => {
  void safeAnimate(overlay, { opacity: [1, 0] }, { duration: 0.15 })
  void safeAnimate(
    content,
    { opacity: [1, 0], transform: ['scale(1)', 'scale(0.95)'] },
    { duration: 0.15, easing: 'ease-in' },
  ).then(() => {
    onComplete()
  })
}
