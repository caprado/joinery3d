import { describe, it, expect } from 'vitest'
import { addRecentProject, removeRecentProject } from './recent-projects'

describe('addRecentProject', () => {
  it('adds a path to the front of the list', () => {
    const result = addRecentProject([], '/projects/a.json')
    expect(result).toStrictEqual(['/projects/a.json'])
  })

  it('moves a duplicate path to the front', () => {
    const result = addRecentProject(
      ['/projects/a.json', '/projects/b.json'],
      '/projects/b.json',
    )
    expect(result).toStrictEqual(['/projects/b.json', '/projects/a.json'])
  })

  it('limits to 10 entries', () => {
    const initial = Array.from({ length: 10 }, (_, i) => `/projects/${String(i)}.json`)
    const result = addRecentProject(initial, '/projects/new.json')
    expect(result).toHaveLength(10)
    expect(result[0]).toBe('/projects/new.json')
    expect(result[9]).toBe('/projects/8.json')
  })

  it('preserves order of existing entries', () => {
    const result = addRecentProject(
      ['/projects/a.json', '/projects/b.json', '/projects/c.json'],
      '/projects/d.json',
    )
    expect(result).toStrictEqual([
      '/projects/d.json',
      '/projects/a.json',
      '/projects/b.json',
      '/projects/c.json',
    ])
  })
})

describe('removeRecentProject', () => {
  it('removes a path from the list', () => {
    const result = removeRecentProject(
      ['/projects/a.json', '/projects/b.json'],
      '/projects/a.json',
    )
    expect(result).toStrictEqual(['/projects/b.json'])
  })

  it('returns the list unchanged if path not found', () => {
    const list = ['/projects/a.json']
    const result = removeRecentProject(list, '/projects/x.json')
    expect(result).toStrictEqual(['/projects/a.json'])
  })
})
