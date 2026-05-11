import type { TextureId } from './ids'

export type Texture = {
  readonly id: TextureId
  readonly name: string
  readonly file: string
  readonly width: number
  readonly height: number
  readonly tags: readonly string[]
}
