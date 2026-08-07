import type { BackupRecord, BackupStatusFilter } from '../types/backup.types'

export interface BackupStatusCounts {
  all: number
  success: number
  in_progress: number
  failure: number
}

export function filterBackupRecords(
  records: BackupRecord[],
  filter: BackupStatusFilter,
): BackupRecord[] {
  if (filter === 'all') return records
  return records.filter((record) => record.status === filter)
}

export function countBackupStatuses(records: BackupRecord[]): BackupStatusCounts {
  return records.reduce(
    (acc, record) => {
      acc[record.status] += 1
      acc.all += 1
      return acc
    },
    { all: 0, success: 0, in_progress: 0, failure: 0 },
  )
}
