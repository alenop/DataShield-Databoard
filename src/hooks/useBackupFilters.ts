import { useMemo, useState } from 'react'
import type { BackupRecord, BackupStatusFilter } from '../types/backup.types'
import { countBackupStatuses, filterBackupRecords } from '../utils/backupFilters.utils'

interface UseBackupFiltersOptions {
  records: BackupRecord[]
}

export function useBackupFilters({ records }: UseBackupFiltersOptions) {
  const [statusFilter, setStatusFilter] = useState<BackupStatusFilter>('all')

  const filteredRecords = useMemo(
    () => filterBackupRecords(records, statusFilter),
    [records, statusFilter],
  )

  const statusCounts = useMemo(() => countBackupStatuses(records), [records])

  return {
    statusFilter,
    setStatusFilter,
    filteredRecords,
    statusCounts,
  }
}

export type BackupFiltersState = ReturnType<typeof useBackupFilters>
