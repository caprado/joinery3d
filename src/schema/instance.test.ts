import { describe, it, expect } from 'vitest'
import { partId } from './ids'
import { emptyAssignment } from './instance'
import { IDENTITY_TRANSFORM } from './transform'

describe('emptyAssignment', () => {
  it('creates a slot assignment with identity offset and no textures', () => {
    const assignment = emptyAssignment(partId('head_male_base'))
    expect(assignment.partId.value).toBe('head_male_base')
    expect(assignment.offset).toStrictEqual(IDENTITY_TRANSFORM)
    expect(assignment.textures).toStrictEqual({})
  })
})
