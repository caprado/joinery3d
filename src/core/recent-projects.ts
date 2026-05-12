export type RecentProjectsList = readonly string[]

const MAX_RECENT_PROJECTS = 10

export const addRecentProject = (
  recentProjects: RecentProjectsList,
  path: string,
): RecentProjectsList => {
  const filtered = recentProjects.filter((project) => project !== path)
  return [path, ...filtered].slice(0, MAX_RECENT_PROJECTS)
}

export const removeRecentProject = (
  recentProjects: RecentProjectsList,
  path: string,
): RecentProjectsList => recentProjects.filter((project) => project !== path)
