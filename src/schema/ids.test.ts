import { describe, it, expect } from 'vitest'
import {
  partId,
  slotTag,
  templateId,
  textureId,
  assetInstanceId,
  isPartId,
  isSlotTag,
  isTextureId,
  isTemplateId,
  isAssetInstanceId,
} from './ids'

describe('ID constructors', () => {
  it('creates a PartId with the correct kind and value', () => {
    const id = partId('head_male_base')
    expect(id.kind).toBe('PartId')
    expect(id.value).toBe('head_male_base')
  })

  it('creates a SlotTag with the correct kind and value', () => {
    const tag = slotTag('head')
    expect(tag.kind).toBe('SlotTag')
    expect(tag.value).toBe('head')
  })

  it('creates a TemplateId with the correct kind and value', () => {
    const id = templateId('humanoid')
    expect(id.kind).toBe('TemplateId')
    expect(id.value).toBe('humanoid')
  })

  it('creates a TextureId with the correct kind and value', () => {
    const id = textureId('skin_pale')
    expect(id.kind).toBe('TextureId')
    expect(id.value).toBe('skin_pale')
  })

  it('creates an AssetInstanceId with the correct kind and value', () => {
    const id = assetInstanceId('elf_warrior_v1')
    expect(id.kind).toBe('AssetInstanceId')
    expect(id.value).toBe('elf_warrior_v1')
  })
})

describe('ID type guards', () => {
  it('isPartId accepts a PartId and rejects others', () => {
    expect(isPartId(partId('x'))).toBe(true)
    expect(isPartId(slotTag('x'))).toBe(false)
    expect(isPartId('x')).toBe(false)
    expect(isPartId(null)).toBe(false)
  })

  it('isSlotTag accepts a SlotTag and rejects others', () => {
    expect(isSlotTag(slotTag('x'))).toBe(true)
    expect(isSlotTag(partId('x'))).toBe(false)
    expect(isSlotTag(42)).toBe(false)
  })

  it('isTextureId accepts a TextureId and rejects others', () => {
    expect(isTextureId(textureId('x'))).toBe(true)
    expect(isTextureId(partId('x'))).toBe(false)
  })

  it('isTemplateId accepts a TemplateId and rejects others', () => {
    expect(isTemplateId(templateId('x'))).toBe(true)
    expect(isTemplateId(textureId('x'))).toBe(false)
  })

  it('isAssetInstanceId accepts an AssetInstanceId and rejects others', () => {
    expect(isAssetInstanceId(assetInstanceId('x'))).toBe(true)
    expect(isAssetInstanceId({})).toBe(false)
  })
})
