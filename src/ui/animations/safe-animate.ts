type AnimateKeyframes = Record<string, string[] | number[]>
type AnimateOptions = { readonly duration: number; readonly easing?: string }

const hasWaapi = (): boolean =>
  typeof Element !== 'undefined' &&
  typeof Element.prototype.animate === 'function'

export const safeAnimate = (
  element: Element,
  keyframes: AnimateKeyframes,
  options: AnimateOptions,
): Promise<void> => {
  if (!hasWaapi()) return Promise.resolve()

  const animation = element.animate(keyframes, {
    duration: options.duration * 1000,
    easing: options.easing ?? 'ease',
    fill: 'forwards',
  })

  return animation.finished.then(() => undefined)
}
