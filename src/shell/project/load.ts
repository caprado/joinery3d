import type { Result } from '../../core/fp/result'
import type { FsAdapter } from '../fs/adapter'
import type { AssetInstance } from '../../schema/instance'
import type { ValidationError } from '../../schema/validation-error'
import { validateInstance } from '../../core/validators/validate-instance'
import { migrateProject } from '../../core/migrate-project'
import { err } from '../../core/fp/result'

export const loadProject = async (
  path: string,
  adapter: FsAdapter,
): Promise<Result<AssetInstance, ValidationError>> => {
  const content = await adapter.readTextFile(path)

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    return err({ path, message: 'Invalid JSON', received: content.slice(0, 100) })
  }

  const migrated = migrateProject(parsed)
  return validateInstance(migrated, path)
}
