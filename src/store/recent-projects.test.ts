import { describe, it, expect } from 'vitest'
import {
  partId,
  templateId,
  assetInstanceId,
} from '../schema/ids'
import type { AssetInstance } from '../schema/instance'
import { IDENTITY_TRANSFORM } from '../schema/transform'
import { createAppStore } from './store'

const testInstance: AssetInstance = {
  id: assetInstanceId('test'),
  name: 'Test',
  templateId: templateId('humanoid'),
  version: 1,
  slots: {
    head: { partId: partId('head_male_base'), offset: IDENTITY_TRANSFORM, textures: {} },
  },
}

describe('recent projects in store', () => {
  it('starts with empty recent projects', () => {
    const store = createAppStore()
    expect(store.getState().recentProjects).toStrictEqual([])
  })

  it('adds to recent projects when saving', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    store.getState().instanceSaved('/projects/a.json')

    expect(store.getState().recentProjects).toStrictEqual(['/projects/a.json'])
  })

  it('adds to recent projects when loading', () => {
    const store = createAppStore()
    store.getState().instanceLoaded(testInstance, '/projects/b.json')

    expect(store.getState().recentProjects).toStrictEqual(['/projects/b.json'])
  })

  it('moves duplicate to front on re-save', () => {
    const store = createAppStore()
    store.getState().instanceCreated(testInstance)
    store.getState().instanceSaved('/projects/a.json')
    store.getState().instanceSaved('/projects/b.json')
    store.getState().instanceSaved('/projects/a.json')

    expect(store.getState().recentProjects).toStrictEqual([
      '/projects/a.json',
      '/projects/b.json',
    ])
  })

  it('can be initialized via setRecentProjects', () => {
    const store = createAppStore()
    store.getState().setRecentProjects(['/old/project1.json', '/old/project2.json'])

    expect(store.getState().recentProjects).toStrictEqual([
      '/old/project1.json',
      '/old/project2.json',
    ])
  })

  it('selecting a recent project opens it', () => {
    const store = createAppStore()
    store.getState().instanceLoaded(testInstance, '/projects/a.json')
    store.getState().instanceLoaded(
      { ...testInstance, name: 'Second' },
      '/projects/b.json',
    )

    expect(store.getState().recentProjects[0]).toBe('/projects/b.json')
    expect(store.getState().recentProjects[1]).toBe('/projects/a.json')
    expect(store.getState().currentInstance?.name).toBe('Second')
  })
})
