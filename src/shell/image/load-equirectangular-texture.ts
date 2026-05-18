import { EquirectangularReflectionMapping, SRGBColorSpace, TextureLoader } from 'three'
import type { Texture } from 'three'

export const loadEquirectangularTexture = (imageUrl: string): Promise<Texture> =>
  new Promise((resolve, reject) => {
    const loader = new TextureLoader()
    loader.load(
      imageUrl,
      (texture) => {
        texture.mapping = EquirectangularReflectionMapping
        texture.colorSpace = SRGBColorSpace
        resolve(texture)
      },
      undefined,
      (error) => {
        reject(error instanceof Error ? error : new Error('Failed to load equirectangular texture'))
      },
    )
  })
