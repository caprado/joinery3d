import { describe, it, expect } from 'vitest'
import { slotTag, partId } from './ids'
import { slotByTag } from './template'
import type { Template, SlotDefinition } from './template'
import { IDENTITY_TRANSFORM } from './transform'

const headSlot: SlotDefinition = {
  tag: slotTag('head'),
  name: 'Head',
  anchor: IDENTITY_TRANSFORM,
  defaultPartId: partId('head_male_base'),
  pairedSlot: undefined,
  required: true,
}

const leftArmSlot: SlotDefinition = {
  tag: slotTag('left_arm'),
  name: 'Left Arm',
  anchor: { position: [-0.4, 1.2, 0], rotation: [0, 0, 0], scale: 1 },
  defaultPartId: partId('arm_human_base'),
  pairedSlot: slotTag('right_arm'),
  required: true,
}

const testTemplate: Template = {
  id: templateId('humanoid'),
  name: 'Humanoid',
  description: 'Basic biped',
  slots: [headSlot, leftArmSlot],
  version: 1,
}

import { templateId } from './ids'

describe('slotByTag', () => {
  it('finds a slot by its tag', () => {
    const found = slotByTag(testTemplate, slotTag('head'))
    expect(found).toBeDefined()
    expect(found?.name).toBe('Head')
  })

  it('returns undefined for an unknown tag', () => {
    expect(slotByTag(testTemplate, slotTag('tail'))).toBeUndefined()
  })

  it('finds paired slot definitions', () => {
    const found = slotByTag(testTemplate, slotTag('left_arm'))
    expect(found).toBeDefined()
    expect(found?.pairedSlot?.value).toBe('right_arm')
  })
})
