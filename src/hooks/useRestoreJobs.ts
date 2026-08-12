import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import i18n from '../i18n'
import { mockRestoreJobs } from '../data/mockRestoreJobs'
import type {
  CreateRestoreJobInput,
  RestoreBackupOption,
  RestoreJob,
  RestoreTargetOption,
} from '../types/restoreJob.types'
import { RESTORE_PROGRESS_INTERVAL_MS, RESTORE_SIMULATION_MS } from '../types/restoreJob.types'
import {
  createRestoreJob,
  parseStoredRestoreJobs,
  validateCreateRestoreJobInput,
} from '../utils/restoreJob.utils'
import type { AuditLogger } from '../utils/auditLogger.utils'

export const RESTORE_JOBS_STORAGE_KEY = 'datashield-restore-jobs'

export function loadRestoreJobs(): RestoreJob[] {
  const stored = localStorage.getItem(RESTORE_JOBS_STORAGE_KEY)
  return parseStoredRestoreJobs(stored, mockRestoreJobs)
}

interface UseRestoreJobsOptions {
  availableBackups: RestoreBackupOption[]
  availableTargets: RestoreTargetOption[]
  logAudit?: AuditLogger
}

export function useRestoreJobs({
  availableBackups,
  availableTargets,
  logAudit,
}: UseRestoreJobsOptions) {
  const [jobRecords, setJobRecords] = useState<RestoreJob[]>(loadRestoreJobs)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())
  const finalizeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const completedJobsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    localStorage.setItem(RESTORE_JOBS_STORAGE_KEY, JSON.stringify(jobRecords))
  }, [jobRecords])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  const clearJobTimers = useCallback((jobId: string) => {
    const interval = intervalsRef.current.get(jobId)
    if (interval) {
      clearInterval(interval)
      intervalsRef.current.delete(jobId)
    }

    const finalizeTimer = finalizeTimersRef.current.get(jobId)
    if (finalizeTimer) {
      clearTimeout(finalizeTimer)
      finalizeTimersRef.current.delete(jobId)
    }
  }, [])

  useEffect(() => {
    const intervals = intervalsRef.current
    const finalizeTimers = finalizeTimersRef.current
    return () => {
      intervals.forEach((interval) => clearInterval(interval))
      intervals.clear()
      finalizeTimers.forEach((timer) => clearTimeout(timer))
      finalizeTimers.clear()
    }
  }, [])

  const completeRestoreJob = useCallback(
    (jobId: string, jobName: string) => {
      if (completedJobsRef.current.has(jobId)) return
      completedJobsRef.current.add(jobId)

      clearJobTimers(jobId)

      let didComplete = false

      flushSync(() => {
        setJobRecords((prev) => {
          const current = prev.find((job) => job.id === jobId)
          if (!current || current.status !== 'in_progress') {
            completedJobsRef.current.delete(jobId)
            return prev
          }

          didComplete = true

          return prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'success' as const,
                  restoredCount: job.totalCount,
                }
              : job,
          )
        })
      })

      if (!didComplete) return

      setNotification({
        message: i18n.t('notifications.restoreCompleted', { name: jobName }),
        type: 'success',
      })
      logAudit?.({
        actionCode: 'RESTORE_JOB_COMPLETED',
        status: 'success',
        metadata: { name: jobName },
      })
    },
    [clearJobTimers, logAudit],
  )

  const scheduleRestoreSimulation = useCallback(
    (jobId: string, jobName: string) => {
      if (
        intervalsRef.current.has(jobId) ||
        finalizeTimersRef.current.has(jobId) ||
        completedJobsRef.current.has(jobId)
      ) {
        return
      }

      const interval = setInterval(() => {
        setJobRecords((prev) =>
          prev.map((job) => {
            if (job.id !== jobId || job.status !== 'in_progress') return job

            const increment = Math.max(1, Math.round(job.totalCount / 20))
            const nextCount = Math.min(job.restoredCount + increment, job.totalCount)

            return { ...job, restoredCount: nextCount }
          }),
        )
      }, RESTORE_PROGRESS_INTERVAL_MS)

      intervalsRef.current.set(jobId, interval)

      const finalizeTimer = setTimeout(() => {
        completeRestoreJob(jobId, jobName)
      }, RESTORE_SIMULATION_MS)

      finalizeTimersRef.current.set(jobId, finalizeTimer)
    },
    [completeRestoreJob],
  )

  useEffect(() => {
    jobRecords
      .filter((job) => job.status === 'in_progress')
      .forEach((job) => {
        scheduleRestoreSimulation(job.id, job.name)
      })
  }, [jobRecords, scheduleRestoreSimulation])

  const launchRestore = useCallback(
    (input: CreateRestoreJobInput): string | null => {
      const error = validateCreateRestoreJobInput(
        input,
        availableBackups,
        availableTargets,
      )
      if (error) return error

      const backup = availableBackups.find((item) => item.id === input.backupId)
      if (!backup) return i18n.t('notifications.backupNotFound')

      const created = createRestoreJob(input, backup)
      setJobRecords((prev) => [created, ...prev])
      logAudit?.({
        actionCode: 'RESTORE_JOB_TRIGGERED',
        status: 'success',
        metadata: { name: created.name },
      })
      scheduleRestoreSimulation(created.id, created.name)
      setNotification({
        message: i18n.t('notifications.restoreLaunched', { name: created.name }),
        type: 'success',
      })
      return null
    },
    [availableBackups, availableTargets, scheduleRestoreSimulation, logAudit],
  )

  return {
    restoreJobs: jobRecords,
    notification,
    launchRestore,
  }
}

export type RestoreJobsState = ReturnType<typeof useRestoreJobs>
