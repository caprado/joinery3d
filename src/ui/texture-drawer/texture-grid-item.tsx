import type { JSX } from 'preact'

export type TextureGridItemProps = {
  readonly textureId: string
  readonly textureName: string
  readonly textureFile: string
  readonly isSelected: boolean
  readonly onSelect: () => void
}

export const TextureGridItem = (props: TextureGridItemProps): JSX.Element => {
  return (
    <button
      type="button"
      class={`texture-grid-item ${props.isSelected ? 'texture-grid-item--selected' : ''}`}
      onClick={props.onSelect}
    >
      <div class="texture-grid-item-preview" title={props.textureFile} />
      <span class="texture-grid-item-name">{props.textureName}</span>
    </button>
  )
}
