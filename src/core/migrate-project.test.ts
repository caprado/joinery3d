import { describe, it, expect } from 'vitest'
import { migrateProject } from './migrate-project'

describe('migrateProject', () => {
  it('returns v1 data unchanged', () => {
    const data = { id: 'test', version: 1, slots: {} }
    expect(migrateProject(data)).toStrictEqual(data)
  })

  it('adds version 1 to data without version', () => {
    const data = { id: 'test', slots: {} }
    const result = migrateProject(data)
    expect(typeof result === 'object' && result !== null && 'version' in result).toBe(true)
    if (typeof result === 'object' && result !== null && 'version' in result) {
      expect(result.version).toBe(1)
    }
  })

  it('migrates version 0 to version 1', () => {
    const data = { id: 'test', version: 0, slots: {} }
    const result = migrateProject(data)
    if (typeof result === 'object' && result !== null && 'version' in result) {
      expect(result.version).toBe(1)
    }
  })

  it('preserves existing fields during migration', () => {
    const data = { id: 'my-asset', name: 'Test', templateId: 'humanoid', slots: {} }
    const result = migrateProject(data)
    if (typeof result === 'object' && result !== null) {
      const record = result as Record<string, unknown>
      expect(record['id']).toBe('my-asset')
      expect(record['name']).toBe('Test')
      expect(record['templateId']).toBe('humanoid')
    }
  })

  it('returns non-object data unchanged', () => {
    expect(migrateProject('not an object')).toBe('not an object')
    expect(migrateProject(null)).toBe(null)
  })
})
