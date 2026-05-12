import type { JSX } from 'preact'
import { useRef, useState, useEffect } from 'preact/hooks'
import type { PainterTool } from '../../core/canvas-painter'
import { hexToColor } from '../../core/hex-to-color'
import {
  createPainterState,
  setActiveTool,
  setBrushSize,
  setColor,
  pushUndoSnapshot,
  popUndo,
  popRedo,
  canUndo,
  canRedo,
} from '../../core/canvas-painter'
import { drawBrushStroke, drawEraserStroke, floodFill, canvasToBlob } from '../../shell/canvas/draw-operations'
import { loadImageToCanvas, fillCanvasWhite } from '../../shell/canvas/load-image-to-canvas'
import { takeCanvasSnapshot, restoreCanvasSnapshot } from '../../shell/canvas/snapshot'
import { Button } from '../common/button'

export type TexturePainterProps = {
  readonly width: number
  readonly height: number
  readonly initialImageData: Uint8Array | undefined
  readonly onSave: (name: string, data: Uint8Array) => void
  readonly onClose: () => void
}

export const TexturePainter = (props: TexturePainterProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [painterState, setPainterState] = useState(
    () => createPainterState(props.width, props.height),
  )
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPosition, setLastPosition] = useState<
    { readonly x: number; readonly y: number } | undefined
  >(undefined)
  const [saveName, setSaveName] = useState('')
  const [colorInput, setColorInput] = useState('#000000')

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    if (props.initialImageData !== undefined) {
      loadImageToCanvas(canvas, props.initialImageData)
    } else {
      fillCanvasWhite(canvas)
    }
  }, [props.initialImageData, props.width, props.height])

  const getCanvasContext = (): CanvasRenderingContext2D | undefined => {
    const canvas = canvasRef.current
    if (canvas === null) return undefined
    return canvas.getContext('2d') ?? undefined
  }

  const getCanvasPosition = (
    event: MouseEvent,
  ): { readonly x: number; readonly y: number } => {
    const canvas = canvasRef.current
    if (canvas === null) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * props.width,
      y: ((event.clientY - rect.top) / rect.height) * props.height,
    }
  }

  const saveCurrentSnapshot = (): void => {
    const context = getCanvasContext()
    if (context === undefined) return
    const snapshot = takeCanvasSnapshot(context, props.width, props.height)
    setPainterState((current) => pushUndoSnapshot(current, snapshot))
  }

  const handleMouseDown = (event: MouseEvent): void => {
    saveCurrentSnapshot()
    setIsDrawing(true)
    const position = getCanvasPosition(event)
    setLastPosition(position)

    const context = getCanvasContext()
    if (context === undefined) return

    if (painterState.activeTool === 'fill') {
      floodFill({
        context,
        startX: position.x,
        startY: position.y,
        color: painterState.color,
        width: props.width,
        height: props.height,
      })
      setIsDrawing(false)
    }
  }

  const handleMouseMove = (event: MouseEvent): void => {
    if (!isDrawing || lastPosition === undefined) return
    const context = getCanvasContext()
    if (context === undefined) return

    const position = getCanvasPosition(event)

    if (painterState.activeTool === 'brush') {
      drawBrushStroke({
        context,
        fromX: lastPosition.x,
        fromY: lastPosition.y,
        toX: position.x,
        toY: position.y,
        brushSize: painterState.brushSize,
        color: painterState.color,
      })
    } else if (painterState.activeTool === 'eraser') {
      drawEraserStroke({
        context,
        fromX: lastPosition.x,
        fromY: lastPosition.y,
        toX: position.x,
        toY: position.y,
        brushSize: painterState.brushSize,
      })
    }

    setLastPosition(position)
  }

  const handleMouseUp = (): void => {
    setIsDrawing(false)
    setLastPosition(undefined)
  }

  const handleUndo = (): void => {
    const context = getCanvasContext()
    if (context === undefined) return
    const currentSnapshot = takeCanvasSnapshot(context, props.width, props.height)
    const result = popUndo(painterState, currentSnapshot)
    if (result === undefined) return
    restoreCanvasSnapshot(context, result.snapshot)
    setPainterState(result.state)
  }

  const handleRedo = (): void => {
    const context = getCanvasContext()
    if (context === undefined) return
    const currentSnapshot = takeCanvasSnapshot(context, props.width, props.height)
    const result = popRedo(painterState, currentSnapshot)
    if (result === undefined) return
    restoreCanvasSnapshot(context, result.snapshot)
    setPainterState(result.state)
  }

  const handleSave = (): void => {
    const canvas = canvasRef.current
    if (canvas === null || saveName.trim().length === 0) return
    void canvasToBlob(canvas).then((data) => {
      props.onSave(saveName.trim(), data)
    })
  }

  const handleColorChange = (event: Event): void => {
    const target = event.currentTarget
    if (!(target instanceof HTMLInputElement)) return
    const hex = target.value
    setColorInput(hex)
    const parsed = hexToColor(hex)
    if (parsed !== undefined) {
      setPainterState((current) => setColor(current, parsed))
    }
  }

  const handleToolSelected = (tool: PainterTool): void => {
    setPainterState((current) => setActiveTool(current, tool))
  }

  const handleBrushSizeChanged = (event: Event): void => {
    const target = event.currentTarget
    if (!(target instanceof HTMLInputElement)) return
    const size = parseInt(target.value, 10)
    if (Number.isFinite(size)) {
      setPainterState((current) => setBrushSize(current, size))
    }
  }

  return (
    <div class="texture-painter">
      <div class="texture-painter-toolbar">
        <button
          type="button"
          class={`texture-painter-tool ${painterState.activeTool === 'brush' ? 'texture-painter-tool--active' : ''}`}
          onClick={() => { handleToolSelected('brush') }}
        >
          Brush
        </button>
        <button
          type="button"
          class={`texture-painter-tool ${painterState.activeTool === 'eraser' ? 'texture-painter-tool--active' : ''}`}
          onClick={() => { handleToolSelected('eraser') }}
        >
          Eraser
        </button>
        <button
          type="button"
          class={`texture-painter-tool ${painterState.activeTool === 'fill' ? 'texture-painter-tool--active' : ''}`}
          onClick={() => { handleToolSelected('fill') }}
        >
          Fill
        </button>
        <input
          type="color"
          class="texture-painter-color"
          value={colorInput}
          onInput={handleColorChange}
        />
        <label class="texture-painter-size-label">
          Size:
          <input
            type="range"
            class="texture-painter-size"
            min="1"
            max="32"
            value={painterState.brushSize}
            onInput={handleBrushSizeChanged}
          />
        </label>
        <Button
          label="Undo"
          onClick={handleUndo}
          isDisabled={!canUndo(painterState)}
        />
        <Button
          label="Redo"
          onClick={handleRedo}
          isDisabled={!canRedo(painterState)}
        />
      </div>
      <canvas
        ref={canvasRef}
        class="texture-painter-canvas"
        width={props.width}
        height={props.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div class="texture-painter-save">
        <input
          type="text"
          class="texture-painter-save-name"
          placeholder="Texture name..."
          value={saveName}
          onInput={(event) => {
            setSaveName(event.currentTarget.value)
          }}
        />
        <Button
          label="Save as New Texture"
          onClick={handleSave}
          variant="primary"
          isDisabled={saveName.trim().length === 0}
        />
        <Button
          label="Close"
          onClick={props.onClose}
        />
      </div>
    </div>
  )
}
