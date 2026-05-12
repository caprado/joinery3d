import type { RecentProjectsList } from '../core/recent-projects'

const STORAGE_KEY = 'joinery3d:recentProjects'

export const loadRecentProjects = (): RecentProjectsList => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export const persistRecentProjects = (projects: RecentProjectsList): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {
    // localStorage may be unavailable or full
  }
}
