import type { JSX } from 'preact'
import type { TextureVariant } from '../../schema/part'

export type VariantSelectorProps = {
  readonly variants: readonly TextureVariant[]
  readonly currentTextureId: string | undefined
  readonly onVariantSelected: (textureId: string) => void
}

export const VariantSelector = (props: VariantSelectorProps): JSX.Element | null => {
  if (props.variants.length === 0) return null

  return (
    <div class="variant-selector">
      <h4 class="variant-selector-title">Variants</h4>
      <ul class="variant-selector-list">
        {props.variants.map((variant) => (
          <li key={variant.textureId.value}>
            <button
              type="button"
              class={`variant-selector-item ${variant.textureId.value === props.currentTextureId ? 'variant-selector-item--active' : ''}`}
              onClick={() => {
                props.onVariantSelected(variant.textureId.value)
              }}
            >
              {variant.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
