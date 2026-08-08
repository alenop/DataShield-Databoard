import type { BackupRecord } from '../types/backup.types'
import type { BackupSource } from '../types/backupSource.types'
import type { RestoreBackupOption } from '../types/restoreJob.types'

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
  records: BackupRecord[],
  sources: BackupSource[],
): BackupRecord[] {
  return records.filter((backup) => isBackupLinkedToSource(backup, sources))
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
