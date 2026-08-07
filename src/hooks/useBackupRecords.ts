import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BackupRecord, BackupStatusFilter } from '../types/backup.types'
import { applyBackupFilters, countBackupStatuses } from '../utils/backupFilters.utils'
import type { BackupSource } from '../types/backupSource.types'
import {
  getRetryDelayMs,
  markBackupInProgress,
  resolveRetryOutcome,
  resolveUserStoppedOutcome,
} from '../utils/backupRetry.utils'

interface LaunchBackupInput {
  name: string
  source: BackupSource
}

interface UseBackupRecordsOptions {
  initialRecords: BackupRecord[]
  username: string
}

export function useBackupRecords({ initialRecords, username }: UseBackupRecordsOptions) {
  const [records, setRecords] = useState(initialRecords)
  const [statusFilter, setStatusFilter] = useState<BackupStatusFilter>('all')
  const [sourceQuery, setSourceQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const retryTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const filteredRecords = useMemo(
    () => applyBackupFilters(records, statusFilter, sourceQuery),
    [records, statusFilter, sourceQuery],
  )

  const statusCounts = useMemo(() => countBackupStatuses(records), [records])

  const selectedBackup = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId],
  )

  const selectBackup = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  const retryBackup = useCallback((id: string) => {
    setRecords((prev) => {
      const record = prev.find((item) => item.id === id)
      if (!record || record.status === 'in_progress') return prev

      const wasFailure = record.status === 'failure'
      const existingTimer = retryTimersRef.current.get(id)
      if (existingTimer) clearTimeout(existingTimer)

      const timer = setTimeout(() => {
        setRecords((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...resolveRetryOutcome(wasFailure) } : item,
          ),
        )
        retryTimersRef.current.delete(id)
      }, getRetryDelayMs())

      retryTimersRef.current.set(id, timer)

      return prev.map((item) => (item.id === id ? markBackupInProgress(item) : item))
    })
  }, [])

  const stopBackup = useCallback(
    (id: string) => {
      const existingTimer = retryTimersRef.current.get(id)
      if (existingTimer) {
        clearTimeout(existingTimer)
        retryTimersRef.current.delete(id)
      }

      setRecords((prev) =>
        prev.map((item) =>
          item.id === id && item.status === 'in_progress'
            ? { ...item, ...resolveUserStoppedOutcome(username) }
            : item,
        ),
      )
    },
    [username],
  )

  const launchBackup = useCallback(({ name, source }: LaunchBackupInput) => {
    const id = `BAK-${Date.now().toString(36)}`
    const newRecord: BackupRecord = {
      id,
      name,
      source: source.name,
      date: new Date().toISOString(),
      sizeGb: 0,
      status: 'in_progress',
      durationMinutes: 0,
      description: `Sauvegarde depuis ${source.apiEndpoint} (${source.environment})`,
    }

    setRecords((prev) => [newRecord, ...prev])

    const timer = setTimeout(() => {
      setRecords((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'success',
                sizeGb: Math.round((Math.random() * 80 + 10) * 10) / 10,
                durationMinutes: Math.floor(Math.random() * 20 + 5),
                date: new Date().toISOString(),
              }
            : item,
        ),
      )
      retryTimersRef.current.delete(id)
    }, getRetryDelayMs())

    retryTimersRef.current.set(id, timer)
  }, [])

  useEffect(() => {
    const timers = retryTimersRef.current
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [])

  return {
    records,
    filteredRecords,
    statusFilter,
    setStatusFilter,
    sourceQuery,
    setSourceQuery,
    statusCounts,
    selectedBackup,
    selectedId,
    selectBackup,
    clearSelection,
    retryBackup,
    stopBackup,
    launchBackup,
  }
}

export type BackupRecordsState = ReturnType<typeof useBackupRecords>
