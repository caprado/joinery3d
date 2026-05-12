import { addRecentProject } from '../../core/recent-projects'
import type { AppState } from '../state'

export const instanceSaved = (state: AppState, path: string): AppState => ({
  ...state,
  currentProjectPath: path,
  dirty: false,
  recentProjects: addRecentProject(state.recentProjects, path),
})
