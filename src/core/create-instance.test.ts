import { describe, it, expect } from 'vitest'
import { partId, slotTag, templateId } from '../schema/ids'
import type { Template } from '../schema/template'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { createInstanceFromTemplate } from './create-instance'

const humanoidTemplate: Template = {
  id: templateId('humanoid'),
  name: 'Humanoid',
  description: 'Basic biped',
  version: 1,
  slots: [
    {
      tag: slotTag('head'),
      name: 'Head',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: partId('head_male_base'),
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: slotTag('torso'),
      name: 'Torso',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: partId('torso_male_base'),
      pairedSlot: undefined,
      required: true,
    },
    {
      tag: slotTag('optional_slot'),
      name: 'Optional',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: undefined,
      pairedSlot: undefined,
      required: false,
    },
  ],
}

describe('createInstanceFromTemplate', () => {
  it('creates an instance with the template id', () => {
    const instance = createInstanceFromTemplate(humanoidTemplate, 'My Humanoid')
    expect(instance.templateId.value).toBe('humanoid')
  })

  it('sets the instance name', () => {
    const instance = createInstanceFromTemplate(humanoidTemplate, 'My Humanoid')
    expect(instance.name).toBe('My Humanoid')
  })

  it('generates a unique instance id', () => {
    const a = createInstanceFromTemplate(humanoidTemplate, 'A')
    const b = createInstanceFromTemplate(humanoidTemplate, 'B')
    expect(a.id.value).not.toBe(b.id.value)
  })

  it('fills slots that have default parts', () => {
    const instance = createInstanceFromTemplate(humanoidTemplate, 'Test')
    expect(instance.slots['head']?.partId.value).toBe('head_male_base')
    expect(instance.slots['torso']?.partId.value).toBe('torso_male_base')
  })

  it('assigns identity offset to default slots', () => {
    const instance = createInstanceFromTemplate(humanoidTemplate, 'Test')
    expect(instance.slots['head']?.offset).toStrictEqual(IDENTITY_TRANSFORM)
  })

  it('assigns empty textures to default slots', () => {
    const instance = createInstanceFromTemplate(humanoidTemplate, 'Test')
    expect(instance.slots['head']?.textures).toStrictEqual({})
  })

  it('skips slots without a default part', () => {
    const instance = createInstanceFromTemplate(humanoidTemplate, 'Test')
    expect(instance.slots['optional_slot']).toBeUndefined()
  })

  it('sets version to 1', () => {
    const instance = createInstanceFromTemplate(humanoidTemplate, 'Test')
    expect(instance.version).toBe(1)
  })
})
