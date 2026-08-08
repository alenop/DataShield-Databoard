import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BackupRecord, BackupStatusFilter } from '../types/backup.types'
import { applyBackupFilters, countBackupStatuses } from '../utils/backupFilters.utils'
import type { BackupSource } from '../types/backupSource.types'
import {
  BACKUP_SIMULATION_DURATION_MS,
  BACKUP_SIZE_INCREMENT_GB,
  BACKUP_TICK_INTERVAL_MS,
  getBackupProgressPercent,
  getLaunchFailureDetails,
  getLaunchFailureNotification,
  getLaunchSuccessNotification,
  shouldSimulateBackupFailure,
} from '../utils/backupSimulation.utils'
import { markBackupInProgress, resolveUserStoppedOutcome } from '../utils/backupRetry.utils'
import { filterBackupsWithKnownSources } from '../utils/backupRecord.utils'

interface LaunchBackupInput {
  name: string
  source: BackupSource
}

interface BackupNotification {
  message: string
  type: 'success' | 'error'
}

interface UseBackupRecordsOptions {
  initialRecords: BackupRecord[]
  username: string
  sources: BackupSource[]
}

export function useBackupRecords({ initialRecords, username, sources }: UseBackupRecordsOptions) {
  const [records, setRecords] = useState(() =>
    filterBackupsWithKnownSources(initialRecords, sources),
  )
  const [statusFilter, setStatusFilter] = useState<BackupStatusFilter>('all')
  const [sourceQuery, setSourceQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notification, setNotification] = useState<BackupNotification | null>(null)
  const progressIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())
  const finalizeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const visibleRecords = useMemo(
    () => filterBackupsWithKnownSources(records, sources),
    [records, sources],
  )

  const filteredRecords = useMemo(
    () => applyBackupFilters(visibleRecords, statusFilter, sourceQuery),
    [visibleRecords, statusFilter, sourceQuery],
  )

  const statusCounts = useMemo(() => countBackupStatuses(visibleRecords), [visibleRecords])

  const selectedBackup = useMemo(
    () => visibleRecords.find((record) => record.id === selectedId) ?? null,
    [visibleRecords, selectedId],
  )

  const clearBackupTimers = useCallback((id: string) => {
    const interval = progressIntervalsRef.current.get(id)
    if (interval) {
      clearInterval(interval)
      progressIntervalsRef.current.delete(id)
    }

    const timer = finalizeTimersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      finalizeTimersRef.current.delete(id)
    }
  }, [])

  const startBackupSimulation = useCallback(
    (id: string, sourceName: string) => {
      let elapsedSeconds = 0
      const willFail = shouldSimulateBackupFailure()

      const interval = setInterval(() => {
        elapsedSeconds += 1
        setRecords((current) =>
          current.map((item) =>
            item.id === id && item.status === 'in_progress'
              ? {
                  ...item,
                  sizeGb: item.sizeGb + BACKUP_SIZE_INCREMENT_GB,
                  durationMinutes: elapsedSeconds,
                }
              : item,
          ),
        )
      }, BACKUP_TICK_INTERVAL_MS)

      progressIntervalsRef.current.set(id, interval)

      const timer = setTimeout(() => {
        clearInterval(interval)
        progressIntervalsRef.current.delete(id)

        setRecords((current) =>
          current.map((item) => {
            if (item.id !== id) return item

            if (willFail) {
              return {
                ...item,
                status: 'failure' as const,
                date: new Date().toISOString(),
                ...getLaunchFailureDetails(),
              }
            }

            return {
              ...item,
              status: 'success' as const,
              sizeGb: Math.max(item.sizeGb, BACKUP_SIZE_INCREMENT_GB),
              durationMinutes: Math.max(elapsedSeconds, 1),
              date: new Date().toISOString(),
              errorReason: undefined,
              errorMessage: undefined,
            }
          }),
        )

        setNotification({
          message: willFail
            ? getLaunchFailureNotification()
            : getLaunchSuccessNotification(sourceName),
          type: willFail ? 'error' : 'success',
        })

        finalizeTimersRef.current.delete(id)
      }, BACKUP_SIMULATION_DURATION_MS)

      finalizeTimersRef.current.set(id, timer)
    },
    [],
  )

  const selectBackup = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  const retryBackup = useCallback(
    (id: string) => {
      setRecords((prev) => {
        const record = prev.find((item) => item.id === id)
        if (!record || record.status === 'in_progress') return prev

        clearBackupTimers(id)
        startBackupSimulation(id, record.source)

        return prev.map((item) => (item.id === id ? markBackupInProgress(item) : item))
      })
    },
    [clearBackupTimers, startBackupSimulation],
  )

  const stopBackup = useCallback(
    (id: string) => {
      clearBackupTimers(id)

      setRecords((prev) =>
        prev.map((item) =>
          item.id === id && item.status === 'in_progress'
            ? { ...item, ...resolveUserStoppedOutcome(username) }
            : item,
        ),
      )
    },
    [username, clearBackupTimers],
  )

  const launchBackup = useCallback(
    ({ name, source }: LaunchBackupInput) => {
      const id = `BAK-${Date.now().toString(36)}`
      const newRecord: BackupRecord = {
        id,
        name,
        sourceId: source.id,
        source: source.name,
        date: new Date().toISOString(),
        sizeGb: 0,
        status: 'in_progress',
        durationMinutes: 0,
        scheduleFrequency: null,
        description: `Sauvegarde depuis ${source.apiEndpoint} (${source.environment})`,
      }

      setRecords((prev) => [newRecord, ...prev])
      startBackupSimulation(id, source.name)
    },
    [startBackupSimulation],
  )

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  useEffect(() => {
    const intervals = progressIntervalsRef.current
    const timers = finalizeTimersRef.current
    return () => {
      intervals.forEach(clearInterval)
      timers.forEach(clearTimeout)
    }
  }, [])

  return {
    records: visibleRecords,
    filteredRecords,
    statusFilter,
    setStatusFilter,
    sourceQuery,
    setSourceQuery,
    statusCounts,
    selectedBackup,
    selectedId,
    notification,
    getBackupProgressPercent,
    selectBackup,
    clearSelection,
    retryBackup,
    stopBackup,
    launchBackup,
  }
}

export type BackupRecordsState = ReturnType<typeof useBackupRecords>
