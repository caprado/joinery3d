import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import type { StoreApi } from 'zustand/vanilla'
import type { Store } from '../../store/store'
import type { FsAdapter } from '../../shell/fs/adapter'
import { useAppStore } from '../../store/use-app-store'
import { selectSelectedSlotTag } from '../../store/selectors/select-selected-slot-tag'
import { selectCurrentSlot } from '../../store/selectors/select-current-slot'
import { textureId } from '../../schema/ids'
import { findTemplate, findPart } from '../../schema/library'
import type { TextureChannel } from '../../schema/part'
import { extractUvEdges } from '../../shell/gltf/extract-uvs'
import type { UvEdge } from '../../shell/gltf/extract-uvs'
import { PropertiesPanel } from '../properties-panel'
import { TextureDrawer } from '../texture-drawer'
import { TexturePainter } from '../texture-drawer/texture-painter'
import { addTextureToLibrary } from './add-texture-to-library'

export type RightSidebarProps = {
  readonly store: StoreApi<Store>
  readonly adapter: FsAdapter
}

export const RightSidebar = (props: RightSidebarProps): JSX.Element => {
  const library = useAppStore(props.store, (state) => state.library)
  const libraryPath = useAppStore(props.store, (state) => state.libraryPath)
  const currentInstance = useAppStore(props.store, (state) => state.currentInstance)
  const toolMode = useAppStore(props.store, (state) => state.toolMode)
  const editorOptions = useAppStore(props.store, (state) => state.editorOptions)
  const selectedSlotTag = useAppStore(props.store, selectSelectedSlotTag)
  const currentSlot = useAppStore(props.store, selectCurrentSlot)

  const [openTextureChannel, setOpenTextureChannel] = useState<TextureChannel | undefined>(undefined)
  const [isPainterOpen, setIsPainterOpen] = useState(false)
  const [painterUvEdges, setPainterUvEdges] = useState<readonly UvEdge[]>([])

  const template = currentInstance !== undefined
    ? findTemplate(library, currentInstance.templateId)
    : undefined

  const currentPart = currentSlot !== undefined
    ? findPart(library, currentSlot.partId)
    : undefined

  const slotName = selectedSlotTag !== undefined && template !== undefined
    ? template.slots.find((slot) => slot.tag.value === selectedSlotTag.value)?.name
    : undefined

  const openPainter = (): void => {
    setIsPainterOpen(true)
    setPainterUvEdges([])
    if (currentPart !== undefined && libraryPath !== undefined) {
      const isAbsoluteUrl = currentPart.meshFile.startsWith('blob:')
        || currentPart.meshFile.startsWith('http:')
        || currentPart.meshFile.startsWith('https:')
      const meshPath = isAbsoluteUrl
        ? currentPart.meshFile
        : `${libraryPath}/${currentPart.meshFile}`
      void props.adapter.readBinaryFile(meshPath).then((meshData) => {
        return extractUvEdges(meshData)
      }).then((edges) => {
        setPainterUvEdges(edges)
      }).catch(() => {
        setPainterUvEdges([])
      })
    }
  }

  const handleImportTexture = (name: string, data: Uint8Array, width: number, height: number): void => {
    if (libraryPath === undefined) return
    void addTextureToLibrary({
      name,
      data,
      width,
      height,
      libraryPath,
      store: props.store,
      adapter: props.adapter,
    })
  }

  const handlePainterSave = (name: string, data: Uint8Array): void => {
    if (libraryPath === undefined) return
    void addTextureToLibrary({
      name,
      data,
      width: 256,
      height: 256,
      libraryPath,
      store: props.store,
      adapter: props.adapter,
    }).then((newTextureId) => {
      if (selectedSlotTag !== undefined && openTextureChannel !== undefined) {
        props.store.getState().setSlotTexture(selectedSlotTag, openTextureChannel, newTextureId)
      }
    })
    setIsPainterOpen(false)
  }

  return (
    <aside class="app-sidebar-right">
      <PropertiesPanel
        slotName={slotName}
        partName={currentPart?.name}
        assignment={currentSlot}
        toolMode={toolMode}
        onToolModeChanged={(mode) => {
          props.store.getState().setToolMode(mode)
        }}
        onOffsetChanged={(offset) => {
          if (selectedSlotTag !== undefined) {
            props.store.getState().setSlotOffset(selectedSlotTag, offset)
          }
        }}
        onResetOffset={() => {
          if (selectedSlotTag !== undefined) {
            props.store.getState().resetSlotOffset(selectedSlotTag)
          }
        }}
        onSaveAsPartDefault={() => {
          if (currentSlot !== undefined) {
            props.store.getState().savePartDefaultOffset(
              currentSlot.partId,
              currentSlot.offset,
            )
          }
        }}
      />

      {currentSlot !== undefined && (
        <div class="editor-options">
          <h4 class="editor-options-title">Options</h4>
          <label class="editor-option">
            <input
              type="checkbox"
              checked={editorOptions.snapEnabled}
              onChange={() => {
                props.store.getState().setEditorOption({
                  snapEnabled: !editorOptions.snapEnabled,
                })
              }}
            />
            Snap to Grid
          </label>
          <label class="editor-option">
            <input
              type="checkbox"
              checked={editorOptions.mirrorEnabled}
              onChange={() => {
                props.store.getState().setEditorOption({
                  mirrorEnabled: !editorOptions.mirrorEnabled,
                })
              }}
            />
            Mirror to Opposite
          </label>
        </div>
      )}

      {currentPart !== undefined && currentPart.textureSlots.length > 0 && (
        <div class="texture-channels">
          <h4 class="texture-channels-title">Textures</h4>
          {currentPart.textureSlots.map((texSlot) => (
            <button
              key={texSlot.channel}
              type="button"
              class="texture-channel-button"
              onClick={() => { setOpenTextureChannel(texSlot.channel) }}
            >
              <span class="texture-channel-name">{texSlot.channel}</span>
              <span class="texture-channel-value">
                {currentSlot?.textures[texSlot.channel] !== undefined
                  ? library.textures[currentSlot.textures[texSlot.channel]?.value ?? '']?.name ?? 'Unknown'
                  : 'None'}
              </span>
            </button>
          ))}
        </div>
      )}

      {openTextureChannel !== undefined && (
        <TextureDrawer
          isOpen={true}
          channel={openTextureChannel}
          textures={Object.values(library.textures)}
          currentTextureId={currentSlot?.textures[openTextureChannel]?.value}
          onTextureSelected={(selectedTexId) => {
            if (selectedSlotTag !== undefined) {
              props.store.getState().setSlotTexture(
                selectedSlotTag,
                openTextureChannel,
                textureId(selectedTexId),
              )
            }
          }}
          onTextureRemoved={() => {
            if (selectedSlotTag !== undefined) {
              props.store.getState().setSlotTexture(
                selectedSlotTag,
                openTextureChannel,
                undefined,
              )
            }
          }}
          onImportTexture={handleImportTexture}
          onPaint={openPainter}
          onClose={() => { setOpenTextureChannel(undefined) }}
        />
      )}

      {isPainterOpen && (
        <TexturePainter
          width={256}
          height={256}
          initialImageData={undefined}
          uvEdges={painterUvEdges}
          onSave={handlePainterSave}
          onClose={() => { setIsPainterOpen(false) }}
        />
      )}
    </aside>
  )
}
