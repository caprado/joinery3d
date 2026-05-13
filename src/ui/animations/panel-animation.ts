import { safeAnimate } from './safe-animate'

export const animatePanelSlideIn = (element: Element, direction: 'left' | 'right'): void => {
  const translateFrom = direction === 'left' ? '-16px' : '16px'
  void safeAnimate(
    element,
    { opacity: [0, 1], transform: [`translateX(${translateFrom})`, 'translateX(0)'] },
    { duration: 0.25, easing: 'ease-out' },
  )
}

export const animateDrawerOpen = (element: Element): void => {
  void safeAnimate(
    element,
    { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
    { duration: 0.2, easing: 'ease-out' },
  )
}
