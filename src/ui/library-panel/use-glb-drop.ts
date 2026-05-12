import { useEffect, useRef, useState } from 'preact/hooks'

export type GlbDropState = {
  readonly isDragging: boolean
  readonly droppedFile: { readonly name: string; readonly data: Uint8Array } | undefined
  readonly clearDroppedFile: () => void
}

export const useGlbDrop = (containerRef: { readonly current: HTMLElement | null }): GlbDropState => {
  const [isDragging, setIsDragging] = useState(false)
  const [droppedFile, setDroppedFile] = useState<
    { readonly name: string; readonly data: Uint8Array } | undefined
  >(undefined)

  const dragCounterRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return undefined

    const handleDragEnter = (event: DragEvent): void => {
      event.preventDefault()
      dragCounterRef.current += 1
      setIsDragging(true)
    }

    const handleDragLeave = (event: DragEvent): void => {
      event.preventDefault()
      dragCounterRef.current -= 1
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0
        setIsDragging(false)
      }
    }

    const handleDragOver = (event: DragEvent): void => {
      event.preventDefault()
    }

    const handleDrop = (event: DragEvent): void => {
      event.preventDefault()
      dragCounterRef.current = 0
      setIsDragging(false)

      const files = event.dataTransfer?.files
      if (files === undefined || files.length === 0) return

      const file = files[0]
      if (file === undefined || !file.name.endsWith('.glb')) return

      void file.arrayBuffer().then((buffer) => {
        setDroppedFile({ name: file.name, data: new Uint8Array(buffer) })
      })
    }

    container.addEventListener('dragenter', handleDragEnter)
    container.addEventListener('dragleave', handleDragLeave)
    container.addEventListener('dragover', handleDragOver)
    container.addEventListener('drop', handleDrop)

    return () => {
      container.removeEventListener('dragenter', handleDragEnter)
      container.removeEventListener('dragleave', handleDragLeave)
      container.removeEventListener('dragover', handleDragOver)
      container.removeEventListener('drop', handleDrop)
    }
  }, [containerRef])

  const clearDroppedFile = (): void => {
    setDroppedFile(undefined)
  }

  return { isDragging, droppedFile, clearDroppedFile }
}
