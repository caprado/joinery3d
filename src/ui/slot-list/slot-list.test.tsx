/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from 'preact'
import { partId, slotTag, textureId } from '../../schema/ids'
import type { SlotDefinition } from '../../schema/template'
import type { SlotAssignment } from '../../schema/instance'
import type { Part } from '../../schema/part'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import { SlotList } from './slot-list'

const headTag = slotTag('head')
const torsoTag = slotTag('torso')
const headPartId = partId('head_male_base')
const torsoPartId = partId('torso_male_base')

const slots: readonly SlotDefinition[] = [
  {
    tag: headTag,
    name: 'Head',
    anchor: IDENTITY_TRANSFORM,
    defaultPartId: headPartId,
    pairedSlot: undefined,
    required: true,
  },
  {
    tag: torsoTag,
    name: 'Torso',
    anchor: IDENTITY_TRANSFORM,
    defaultPartId: torsoPartId,
    pairedSlot: undefined,
    required: true,
  },
]

const assignments: Partial<Record<string, SlotAssignment>> = {
  head: {
    partId: headPartId,
    offset: IDENTITY_TRANSFORM,
    textures: { diffuse: textureId('skin_pale') },
  },
  torso: {
    partId: torsoPartId,
    offset: IDENTITY_TRANSFORM,
    textures: {},
  },
}

const parts: Record<string, Part> = {
  head_male_base: {
    id: headPartId,
    name: 'Male Head (Base)',
    tags: [headTag],
    meshFile: 'parts/head/head_male_base.glb',
    defaultOffset: IDENTITY_TRANSFORM,
    textureSlots: [],
    thumbnailFile: undefined,
  },
  torso_male_base: {
    id: torsoPartId,
    name: 'Male Torso (Base)',
    tags: [torsoTag],
    meshFile: 'parts/torso/torso_male_base.glb',
    defaultOffset: IDENTITY_TRANSFORM,
    textureSlots: [],
    thumbnailFile: undefined,
  },
}

describe('SlotList', () => {
  it('renders one item per slot', () => {
    const container = document.createElement('div')
    render(
      <SlotList
        slots={slots}
        assignments={assignments}
        parts={parts}
        selectedSlotTag={undefined}
        onSlotSelected={() => undefined}
      />,
      container,
    )
    const items = container.querySelectorAll('.slot-list-item')
    expect(items.length).toBe(2)
  })

  it('displays slot names and part names', () => {
    const container = document.createElement('div')
    render(
      <SlotList
        slots={slots}
        assignments={assignments}
        parts={parts}
        selectedSlotTag={undefined}
        onSlotSelected={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('Head')
    expect(container.textContent).toContain('Male Head (Base)')
    expect(container.textContent).toContain('Torso')
    expect(container.textContent).toContain('Male Torso (Base)')
  })

  it('shows Empty for slots without assignment', () => {
    const container = document.createElement('div')
    render(
      <SlotList
        slots={slots}
        assignments={{}}
        parts={parts}
        selectedSlotTag={undefined}
        onSlotSelected={() => undefined}
      />,
      container,
    )
    expect(container.textContent).toContain('Empty')
  })

  it('highlights the selected slot', () => {
    const container = document.createElement('div')
    render(
      <SlotList
        slots={slots}
        assignments={assignments}
        parts={parts}
        selectedSlotTag="head"
        onSlotSelected={() => undefined}
      />,
      container,
    )
    const selected = container.querySelector('.slot-list-item--selected')
    expect(selected).not.toBeNull()
    expect(selected?.textContent).toContain('Head')
  })

  it('calls onSlotSelected when a slot is clicked', () => {
    const onSlotSelected = vi.fn()
    const container = document.createElement('div')
    render(
      <SlotList
        slots={slots}
        assignments={assignments}
        parts={parts}
        selectedSlotTag={undefined}
        onSlotSelected={onSlotSelected}
      />,
      container,
    )
    const buttons = container.querySelectorAll('.slot-list-item-button')
    if (buttons[0] instanceof HTMLElement) {
      buttons[0].click()
    }
    expect(onSlotSelected).toHaveBeenCalledWith('head')
  })

  it('calls onSlotSelected with the correct tag for each slot', () => {
    const onSlotSelected = vi.fn()
    const container = document.createElement('div')
    render(
      <SlotList
        slots={slots}
        assignments={assignments}
        parts={parts}
        selectedSlotTag={undefined}
        onSlotSelected={onSlotSelected}
      />,
      container,
    )
    const buttons = container.querySelectorAll('.slot-list-item-button')
    if (buttons[1] instanceof HTMLElement) {
      buttons[1].click()
    }
    expect(onSlotSelected).toHaveBeenCalledWith('torso')
  })
})
