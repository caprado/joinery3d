import type { FsAdapter } from '../fs/adapter'
import type { LibraryIndex } from '../../schema/library'
import type { Part } from '../../schema/part'
import type { Template } from '../../schema/template'
import type { Texture } from '../../schema/texture'
import { buildIndexFromParts } from '../../core/library-index'
import { validateTemplate } from '../../core/validators/validate-template'
import { validatePart } from '../../core/validators/validate-part'
import { validateTexture } from '../../core/validators/validate-texture'

const parseJson = (content: string): unknown => {
  try {
    const result: unknown = JSON.parse(content)
    return result
  } catch {
    return undefined
  }
}

export const scanLibrary = async (
  path: string,
  adapter: FsAdapter,
): Promise<LibraryIndex> => {
  const files = await adapter.listFiles(path)

  const templateFiles = files.filter((file) => file.endsWith('.template.json'))
  const partFiles = files.filter(
    (file) => file.endsWith('.json') && !file.endsWith('.template.json') && !file.startsWith('textures/'),
  )
  const textureFiles = files.filter((file) => file.endsWith('.json') && file.startsWith('textures/'))

  const templates = await loadAndValidateAll<Template>(
    templateFiles,
    path,
    adapter,
    (data, filePath) => validateTemplate(data, filePath),
  )

  const parts = await loadAndValidateAll<Part>(
    partFiles,
    path,
    adapter,
    (data, filePath) => validatePart(data, filePath),
  )

  const textures = await loadAndValidateAll<Texture>(
    textureFiles,
    path,
    adapter,
    (data, filePath) => validateTexture(data, filePath),
  )

  return buildIndexFromParts(templates, parts, textures)
}

const loadAndValidateAll = async <T>(
  files: readonly string[],
  basePath: string,
  adapter: FsAdapter,
  validate: (data: unknown, path: string) => { readonly ok: boolean; readonly value?: T },
): Promise<readonly T[]> => {
  const results: T[] = []
  for (const file of files) {
    const fullPath = `${basePath}/${file}`
    try {
      const content = await adapter.readTextFile(fullPath)
      const data = parseJson(content)
      if (data === undefined) continue
      const result = validate(data, file)
      if (result.ok && result.value !== undefined) {
        results.push(result.value)
      }
    } catch {
      // Skip files that can't be read
    }
  }
  return results
}
