import type { LibraryIndex } from '../../schema/library'
import { buildIndexFromParts } from '../../core/library-index'
import { validateTemplate } from '../../core/validators/validate-template'
import { validatePart } from '../../core/validators/validate-part'
import { validateTexture } from '../../core/validators/validate-texture'
import type { Template } from '../../schema/template'
import type { Part } from '../../schema/part'
import type { Texture } from '../../schema/texture'

const TEMPLATE_FILES = [
  'templates/humanoid.template.json',
  'templates/chest.template.json',
  'templates/creature.template.json',
  'templates/prop.template.json',
]

const PART_FILES = [
  'parts/head/head_male_base.json',
  'parts/head/head_female_base.json',
  'parts/head/head_elf.json',
  'parts/torso/torso_male_base.json',
  'parts/torso/torso_female_base.json',
  'parts/torso/torso_armored.json',
  'parts/left_arm/arm_human_base.json',
  'parts/right_arm/arm_human_base_r.json',
  'parts/left_leg/leg_human_base.json',
  'parts/left_leg/leg_armored.json',
  'parts/left_leg/leg_elf.json',
  'parts/right_leg/leg_human_base_r.json',
  'parts/body/chest_body.json',
  'parts/lid/lid_closed.json',
  'parts/lid/lid_open.json',
  'parts/lid/lid_broken.json',
  'parts/lock/lock_iron.json',
  'parts/creature_head/creature_head_wolf.json',
  'parts/creature_head/creature_head_dragon.json',
  'parts/creature_head/creature_head_bear.json',
  'parts/creature_body/creature_body_wolf.json',
  'parts/creature_body/creature_body_dragon.json',
  'parts/creature_body/creature_body_bear.json',
  'parts/creature_tail/creature_tail_wolf.json',
  'parts/creature_tail/creature_tail_dragon.json',
  'parts/prop_base/prop_base_sword.json',
  'parts/prop_base/prop_base_shield.json',
  'parts/prop_base/prop_base_staff.json',
  'parts/prop_attachment/prop_pommel_basic.json',
  'parts/prop_attachment/prop_guard_cross.json',
]

const TEXTURE_FILES = [
  'textures/skin_pale.json',
  'textures/metal_dark.json',
  'textures/wood_dark.json',
]

const fetchJson = async (url: string): Promise<unknown> => {
  try {
    const response = await fetch(url)
    if (!response.ok) return undefined
    const text = await response.text()
    const parsed: unknown = JSON.parse(text)
    return parsed
  } catch {
    return undefined
  }
}

const loadAndValidateAll = async <T>(
  files: readonly string[],
  basePath: string,
  validate: (data: unknown, path: string) => { readonly ok: boolean; readonly value?: T },
): Promise<readonly T[]> => {
  const results = await Promise.all(
    files.map(async (file) => {
      const data = await fetchJson(`${basePath}/${file}`)
      if (data === undefined) return undefined
      const result = validate(data, file)
      return result.ok ? result.value : undefined
    }),
  )
  const filtered: T[] = []
  for (const result of results) {
    if (result !== undefined) filtered.push(result)
  }
  return filtered
}

export const loadSampleLibrary = async (basePath: string): Promise<LibraryIndex> => {
  const [templates, parts, textures] = await Promise.all([
    loadAndValidateAll<Template>(TEMPLATE_FILES, basePath, validateTemplate),
    loadAndValidateAll<Part>(PART_FILES, basePath, validatePart),
    loadAndValidateAll<Texture>(TEXTURE_FILES, basePath, validateTexture),
  ])

  return buildIndexFromParts(templates, parts, textures)
}
