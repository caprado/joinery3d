import { describe, it, expect } from 'vitest'
import { createTemplateFromSlots } from './create-template'
import type { SlotInput } from './create-template'

describe('createTemplateFromSlots', () => {
  it('creates a template with the given name and description', () => {
    const template = createTemplateFromSlots('Vehicle', 'A wheeled vehicle', [])
    expect(template.name).toBe('Vehicle')
    expect(template.description).toBe('A wheeled vehicle')
  })

  it('generates a sanitized id from the name', () => {
    const template = createTemplateFromSlots('My Cool Template!', '', [])
    expect(template.id.value).toBe('my_cool_template_')
  })

  it('creates slot definitions from inputs', () => {
    const inputs: readonly SlotInput[] = [
      { name: 'Body', tag: 'body', anchorPosition: [0, 0, 0] },
      { name: 'Hood', tag: 'hood', anchorPosition: [0, 1, 2] },
    ]
    const template = createTemplateFromSlots('Car', 'A car', inputs)

    expect(template.slots).toHaveLength(2)
    expect(template.slots[0]?.tag.value).toBe('body')
    expect(template.slots[0]?.name).toBe('Body')
    expect(template.slots[0]?.anchor.position).toStrictEqual([0, 0, 0])
    expect(template.slots[1]?.tag.value).toBe('hood')
    expect(template.slots[1]?.anchor.position).toStrictEqual([0, 1, 2])
  })

  it('sets default rotation to zero and scale to 1', () => {
    const inputs: readonly SlotInput[] = [
      { name: 'Body', tag: 'body', anchorPosition: [1, 2, 3] },
    ]
    const template = createTemplateFromSlots('Test', '', inputs)

    expect(template.slots[0]?.anchor.rotation).toStrictEqual([0, 0, 0])
    expect(template.slots[0]?.anchor.scale).toBe(1)
  })

  it('sets slots as required with no default part or paired slot', () => {
    const inputs: readonly SlotInput[] = [
      { name: 'Slot', tag: 'slot', anchorPosition: [0, 0, 0] },
    ]
    const template = createTemplateFromSlots('Test', '', inputs)

    expect(template.slots[0]?.required).toBe(true)
    expect(template.slots[0]?.defaultPartId).toBeUndefined()
    expect(template.slots[0]?.pairedSlot).toBeUndefined()
  })

  it('sets version to 1', () => {
    const template = createTemplateFromSlots('Test', '', [])
    expect(template.version).toBe(1)
  })
})
