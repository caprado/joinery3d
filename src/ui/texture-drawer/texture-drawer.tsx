import type { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import type { Texture } from '../../schema/texture'
import type { TextureChannel } from '../../schema/part'
import { loadImageDimensions } from '../../shell/image/load-dimensions'
import { TextureGridItem } from './texture-grid-item'
import { Button } from '../common/button'

export type TextureDrawerProps = {
  readonly isOpen: boolean
  readonly channel: TextureChannel
  readonly textures: readonly Texture[]
  readonly currentTextureId: string | undefined
  readonly onTextureSelected: (textureId: string) => void
  readonly onTextureRemoved: () => void
  readonly onImportTexture: (name: string, data: Uint8Array, width: number, height: number) => void
  readonly onPaint: () => void
  readonly onClose: () => void
}

export const TextureDrawer = (props: TextureDrawerProps): JSX.Element | null => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  if (!props.isOpen) return null

  const filteredTextures =
    searchQuery.length === 0
      ? props.textures
      : props.textures.filter((texture) =>
          texture.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  const handleFileSelected = (event: Event): void => {
    const target = event.currentTarget
    if (!(target instanceof HTMLInputElement)) return
    const files = target.files
    if (files === null || files.length === 0) return

    const file = files[0]
    if (file === undefined || !file.name.endsWith('.png')) return

    void file.arrayBuffer().then((buffer) => {
      const data = new Uint8Array(buffer)
      loadImageDimensions(data, (width, height) => {
        props.onImportTexture(file.name.replace('.png', ''), data, width, height)
      })
    })
  }

  return (
    <div class="texture-drawer">
      <div class="texture-drawer-header">
        <h3 class="texture-drawer-title">Textures — {props.channel}</h3>
        <button type="button" class="texture-drawer-close" onClick={props.onClose}>
          &times;
        </button>
      </div>
      <div class="texture-drawer-search">
        <input
          type="text"
          class="texture-drawer-search-input"
          placeholder="Search textures..."
          value={searchQuery}
          onInput={(event) => {
            setSearchQuery(event.currentTarget.value)
          }}
        />
      </div>
      <div class="texture-drawer-grid">
        {filteredTextures.map((texture) => (
          <TextureGridItem
            key={texture.id.value}
            textureId={texture.id.value}
            textureName={texture.name}
            textureFile={texture.file}
            isSelected={texture.id.value === props.currentTextureId}
            onSelect={() => {
              props.onTextureSelected(texture.id.value)
            }}
          />
        ))}
      </div>
      {filteredTextures.length === 0 && (
        <p class="texture-drawer-empty">No textures found</p>
      )}
      <div class="texture-drawer-actions">
        <Button
          label="Remove Texture"
          onClick={props.onTextureRemoved}
          isDisabled={props.currentTextureId === undefined}
          variant="danger"
        />
        <Button
          label="Import PNG"
          onClick={() => {
            fileInputRef.current?.click()
          }}
        />
        <Button
          label="Paint"
          onClick={props.onPaint}
          variant="primary"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".png"
          class="texture-drawer-file-input"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
      </div>
    </div>
  )
}
