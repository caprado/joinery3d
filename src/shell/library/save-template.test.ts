import { describe, it, expect } from 'vitest'
import { templateId, slotTag } from '../../schema/ids'
import type { Template } from '../../schema/template'
import { IDENTITY_TRANSFORM } from '../../schema/transform'
import type { FsAdapter } from '../fs/adapter'
import { saveTemplate } from './save-template'

const testTemplate: Template = {
  id: templateId('vehicle'),
  name: 'Vehicle',
  description: 'A wheeled vehicle',
  version: 1,
  slots: [
    {
      tag: slotTag('body'),
      name: 'Body',
      anchor: IDENTITY_TRANSFORM,
      defaultPartId: undefined,
      pairedSlot: undefined,
      required: true,
    },
  ],
}

describe('saveTemplate', () => {
  it('writes the template JSON to the correct path', async () => {
    const written = new Map<string, string>()
    const adapter: FsAdapter = {
      pickFolder: () => Promise.resolve(undefined),
      readTextFile: () => Promise.resolve(''),
      writeTextFile: (path, content) => {
        written.set(path, content)
        return Promise.resolve()
      },
      readBinaryFile: () => Promise.resolve(new Uint8Array()),
      writeBinaryFile: () => Promise.resolve(),
      listFiles: () => Promise.resolve([]),
      watchFolder: () => () => undefined,
    }

    await saveTemplate(testTemplate, '/lib', adapter)

    const filePath = '/lib/templates/vehicle.template.json'
    expect(written.has(filePath)).toBe(true)

    const content = written.get(filePath) ?? ''
    const parsed = JSON.parse(content) as Record<string, unknown>
    expect(parsed['id']).toBe('vehicle')
    expect(parsed['name']).toBe('Vehicle')
    expect(parsed['description']).toBe('A wheeled vehicle')
    expect(parsed['version']).toBe(1)

    const slots = parsed['slots'] as Array<Record<string, unknown>>
    expect(slots).toHaveLength(1)
    expect(slots[0]?.['tag']).toBe('body')
    expect(slots[0]?.['defaultPartId']).toBeNull()
    expect(slots[0]?.['pairedSlot']).toBeNull()
  })
})
