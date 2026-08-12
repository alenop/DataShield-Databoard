import type { BackupRecord } from '../types/backup.types'
import type { BackupSource } from '../types/backupSource.types'
import type { RestoreBackupOption } from '../types/restoreJob.types'
import type { SourceScope } from '../types/sourceScope.types'
import {
  getBackupScopeOptions,
  isSourceScope,
  normalizeScope,
  resolveScopeKey,
  sortScopes,
} from './sourceScope.utils'

type BackupScopeInput = {
  name: string
  scopes?: SourceScope[] | SourceScope | string
  scope?: SourceScope | string
}

export function inferScopesFromBackupName(name: string): SourceScope[] {
  const lower = name.toLowerCase()

  if (lower.includes('complète') || lower.includes('complete') || lower.includes('général')) {
    return ['full']
  }

  const scopes: SourceScope[] = []

  if (lower.includes('contact')) scopes.push('contacts')
  if (lower.includes('compte')) scopes.push('accounts')
  if (lower.includes('opportunit')) scopes.push('opportunities')
  if (lower.includes('piste') || lower.includes('lead')) scopes.push('leads')
  if (lower.includes('métrique') || lower.includes('metrique')) scopes.push('aggregatedMetrics')
  if (lower.includes('api')) scopes.push('apiLogs')

  return scopes
}

/** @deprecated Use inferScopesFromBackupName */
export function inferScopeFromBackupName(name: string): SourceScope | null {
  const scopes = inferScopesFromBackupName(name)
  return scopes[0] ?? null
}

function readRawBackupScopes(backup: BackupScopeInput): SourceScope[] {
  if (Array.isArray(backup.scopes) && backup.scopes.length > 0) {
    return backup.scopes.filter(isSourceScope)
  }

  if (typeof backup.scopes === 'string' && isSourceScope(backup.scopes)) {
    return [backup.scopes]
  }

  if (backup.scope && isSourceScope(backup.scope)) {
    return [backup.scope]
  }

  if (typeof backup.scope === 'string') {
    const legacy = resolveScopeKey(backup.scope)
    if (legacy) return [legacy]
  }

  return []
}

export function resolveBackupScopes(
  backup: BackupScopeInput,
  source?: BackupSource,
): SourceScope[] {
  const allowed = source ? getBackupScopeOptions(source) : undefined
  const raw = readRawBackupScopes(backup)

  const filtered = raw.filter((scope) => !allowed || allowed.includes(scope))
  const unique = sortScopes([...new Set(filtered)])

  if (unique.includes('full')) {
    return ['full']
  }

  if (unique.length > 0) {
    return unique
  }

  const inferred = sortScopes(
    inferScopesFromBackupName(backup.name).filter(
      (scope) => !allowed || allowed.includes(scope),
    ),
  )

  if (inferred.includes('full')) {
    return ['full']
  }

  if (inferred.length > 0) {
    return inferred
  }

  if (allowed && allowed.length > 0) {
    return [allowed[0]]
  }

  return [normalizeScope(undefined)]
}

/** @deprecated Use resolveBackupScopes */
export function resolveBackupScope(
  backup: BackupScopeInput,
  source?: BackupSource,
): SourceScope {
  return resolveBackupScopes(backup, source)[0]
}

export function normalizeBackupRecord(
  record: BackupRecord & { scope?: SourceScope | string },
  sources: BackupSource[],
): BackupRecord {
  const sourceId = resolveBackupSourceId(record, sources)
  const source = sourceId ? sources.find((item) => item.id === sourceId) : undefined
  const { scope: _legacyScope, ...rest } = record

  return {
    ...rest,
    scopes: resolveBackupScopes(record, source),
  }
}

export function normalizeBackupRecords(
  records: (BackupRecord & { scope?: SourceScope | string })[],
  sources: BackupSource[],
): BackupRecord[] {
  return records.map((record) => normalizeBackupRecord(record, sources))
}

export function resolveBackupSourceId(
  backup: BackupRecord,
  sources: BackupSource[],
): string | undefined {
  if (backup.sourceId) {
    return sources.some((source) => source.id === backup.sourceId) ? backup.sourceId : undefined
  }

  return sources.find((source) => source.name === backup.source)?.id
}

export function isBackupLinkedToSource(
  backup: BackupRecord,
  sources: BackupSource[],
): boolean {
  return resolveBackupSourceId(backup, sources) !== undefined
}

export function filterBackupsWithKnownSources(
  records: (BackupRecord & { scope?: SourceScope | string })[],
  sources: BackupSource[],
): BackupRecord[] {
  return normalizeBackupRecords(
    records.filter((backup) => isBackupLinkedToSource(backup, sources)),
    sources,
  )
}

export function getBackupSourceLabel(
  backup: BackupRecord,
  sources: BackupSource[],
): string {
  const sourceId = resolveBackupSourceId(backup, sources)
  const source = sourceId ? sources.find((item) => item.id === sourceId) : undefined
  return source?.name ?? '—'
}

export function buildRestoreBackupOptions(
  records: BackupRecord[],
  sources: BackupSource[],
): RestoreBackupOption[] {
  return records
    .filter((backup) => backup.status === 'success')
    .flatMap((backup) => {
      const sourceId = resolveBackupSourceId(backup, sources)
      if (!sourceId) return []

      const source = sources.find((item) => item.id === sourceId)
      if (!source) return []

      return [
        {
          id: backup.id,
          name: backup.name,
          date: backup.date,
          source: source.name,
          sourceId,
        },
      ]
    })
}
