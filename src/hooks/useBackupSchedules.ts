import { useCallback, useEffect, useState } from 'react'
import i18n from '../i18n'
import { mockBackupSchedules } from '../data/mockBackupSchedules'
import type { BackupSchedule, CreateBackupScheduleInput } from '../types/backupSchedule.types'
import {
  createBackupSchedule,
  parseStoredBackupSchedules,
  validateCreateBackupScheduleInput,
} from '../utils/backupSchedule.utils'

export const BACKUP_SCHEDULES_STORAGE_KEY = 'datashield-backup-schedules'

export function loadBackupSchedules(): BackupSchedule[] {
  const stored = localStorage.getItem(BACKUP_SCHEDULES_STORAGE_KEY)
  return parseStoredBackupSchedules(stored, mockBackupSchedules)
}

export function useBackupSchedules(availableSourceIds: string[]) {
  const [scheduleRecords, setScheduleRecords] = useState<BackupSchedule[]>(loadBackupSchedules)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    localStorage.setItem(BACKUP_SCHEDULES_STORAGE_KEY, JSON.stringify(scheduleRecords))
  }, [scheduleRecords])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  const createSchedule = useCallback(
    (input: CreateBackupScheduleInput): string | null => {
      const error = validateCreateBackupScheduleInput(
        input,
        scheduleRecords.map((schedule) => schedule.name),
        availableSourceIds,
      )
      if (error) return error

      const created = createBackupSchedule(input)
      setScheduleRecords((prev) => [created, ...prev])
      setNotification({
        message: i18n.t('notifications.scheduleCreated', { name: created.name }),
        type: 'success',
      })
      return null
    },
    [scheduleRecords, availableSourceIds],
  )

  const toggleScheduleActive = useCallback((scheduleId: string) => {
    setScheduleRecords((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, isActive: !schedule.isActive } : schedule,
      ),
    )
  }, [])

  const deleteSchedule = useCallback((scheduleId: string) => {
    setScheduleRecords((prev) => prev.filter((schedule) => schedule.id !== scheduleId))
    setNotification({
      message: i18n.t('notifications.scheduleDeleted'),
      type: 'success',
    })
  }, [])

  return {
    schedules: scheduleRecords,
    notification,
    createSchedule,
    toggleScheduleActive,
    deleteSchedule,
  }
}

export type BackupSchedulesState = ReturnType<typeof useBackupSchedules>
