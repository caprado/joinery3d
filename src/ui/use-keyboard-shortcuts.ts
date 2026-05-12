import { useEffect } from 'preact/hooks'

export type KeyboardShortcutHandlers = {
  readonly onUndo: () => void
  readonly onRedo: () => void
}

export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const isCtrlOrMeta = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (isCtrlOrMeta && key === 'z' && !event.shiftKey) {
        event.preventDefault()
        handlers.onUndo()
      }

      if (isCtrlOrMeta && (key === 'y' || (key === 'z' && event.shiftKey))) {
        event.preventDefault()
        handlers.onRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlers])
}
