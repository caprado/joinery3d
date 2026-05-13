import { isRecord } from './validators/is-record'

const CURRENT_VERSION = 1

export const migrateProject = (data: unknown): unknown => {
  if (!isRecord(data)) return data

  const version = typeof data['version'] === 'number' ? data['version'] : 0

  if (version >= CURRENT_VERSION) return data

  return applyMigrations(data, version)
}

const applyMigrations = (
  data: Record<string, unknown>,
  fromVersion: number,
): Record<string, unknown> => {
  if (fromVersion < 1) {
    return migrateToV1(data)
  }
  return data
}

const migrateToV1 = (data: Record<string, unknown>): Record<string, unknown> => ({
  ...data,
  version: 1,
})
