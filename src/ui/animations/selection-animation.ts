import { safeAnimate } from './safe-animate'

export const animateSelectionHighlight = (element: Element): void => {
  void safeAnimate(
    element,
    { backgroundColor: ['rgba(100, 150, 255, 0.3)', 'rgba(100, 150, 255, 0.15)'] },
    { duration: 0.3, easing: 'ease-out' },
  )
}

export const animatePartSwap = (element: Element): void => {
  void safeAnimate(
    element,
    { opacity: [0, 1], transform: ['translateY(-4px)', 'translateY(0)'] },
    { duration: 0.2, easing: 'ease-out' },
  )
}
