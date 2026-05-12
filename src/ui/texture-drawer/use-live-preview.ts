import { useEffect, useRef } from 'preact/hooks'
import type { Object3D } from 'three'
import { updateMeshTextureFromCanvas } from '../../shell/canvas/canvas-to-texture'

export type LivePreviewArgs = {
  readonly canvasRef: { readonly current: HTMLCanvasElement | null }
  readonly meshGroup: Object3D | undefined
  readonly isActive: boolean
  readonly updateIntervalMs: number
}

export const useLivePreview = (args: LivePreviewArgs): void => {
  const intervalRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!args.isActive || args.meshGroup === undefined) {
      return undefined
    }

    const canvas = args.canvasRef.current
    if (canvas === null) return undefined

    const meshGroup = args.meshGroup

    const update = (): void => {
      updateMeshTextureFromCanvas(meshGroup, canvas)
    }

    intervalRef.current = window.setInterval(update, args.updateIntervalMs)

    return () => {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [args.isActive, args.meshGroup, args.canvasRef, args.updateIntervalMs])
}
