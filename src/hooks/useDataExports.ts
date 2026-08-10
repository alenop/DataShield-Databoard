import { useCallback, useEffect, useRef, useState } from 'react'
import i18n from '../i18n'
import { mockDataExports } from '../data/mockDataExports'
import type { CreateDataExportInput, DataExport, ExportSourceOption } from '../types/dataExport.types'
import { EXPORT_PREPARATION_MS } from '../types/dataExport.types'
import {
  createDataExport,
  parseStoredDataExports,
  simulateExportSizeBytes,
  validateCreateExportInput,
} from '../utils/dataExport.utils'

export const EXPORTS_STORAGE_KEY = 'datashield-data-exports'

export function loadDataExports(): DataExport[] {
  const stored = localStorage.getItem(EXPORTS_STORAGE_KEY)
  return parseStoredDataExports(stored, mockDataExports)
}

export function useDataExports(sources: ExportSourceOption[]) {
  const [exportRecords, setExportRecords] = useState<DataExport[]>(loadDataExports)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    localStorage.setItem(EXPORTS_STORAGE_KEY, JSON.stringify(exportRecords))
  }, [exportRecords])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const scheduleExportFinalization = useCallback((exportId: string) => {
    const timer = setTimeout(() => {
      setExportRecords((prev) => {
        const current = prev.find((item) => item.id === exportId)
        if (current) {
          setNotification({
            message: i18n.t('notifications.exportReady', { name: current.name }),
            type: 'success',
          })
        }

        return prev.map((item) =>
          item.id === exportId
            ? {
                ...item,
                status: 'ready' as const,
                sizeBytes: simulateExportSizeBytes(),
              }
            : item,
        )
      })
      timersRef.current.delete(exportId)
    }, EXPORT_PREPARATION_MS)

    timersRef.current.set(exportId, timer)
  }, [])

  useEffect(() => {
    exportRecords
      .filter((item) => item.status === 'preparing')
      .forEach((item) => {
        if (!timersRef.current.has(item.id)) {
          scheduleExportFinalization(item.id)
        }
      })
  }, [exportRecords, scheduleExportFinalization])

  const createExport = useCallback(
    (input: CreateDataExportInput): string | null => {
      const error = validateCreateExportInput(
        input,
        exportRecords.map((item) => item.name),
        sources,
      )
      if (error) return error

      const created = createDataExport(input)
      setExportRecords((prev) => [created, ...prev])
      scheduleExportFinalization(created.id)
      setNotification({
        message: i18n.t('notifications.exportPreparing', { name: created.name }),
        type: 'success',
      })
      return null
    },
    [exportRecords, sources, scheduleExportFinalization],
  )

  const downloadExport = useCallback(
    (exportId: string): string | null => {
      const item = exportRecords.find((record) => record.id === exportId)
      if (!item) return i18n.t('notifications.exportNotFound')
      if (item.status === 'preparing') {
        setNotification({
          message: i18n.t('notifications.exportStillPreparing'),
          type: 'error',
        })
        return i18n.t('notifications.exportStillPreparing')
      }
      if (item.status === 'expired') {
        setNotification({
          message: i18n.t('notifications.exportExpired'),
          type: 'error',
        })
        return i18n.t('notifications.exportExpired')
      }

      setNotification({
        message: i18n.t('notifications.exportDownloadStarted', { name: item.name }),
        type: 'success',
      })
      return null
    },
    [exportRecords],
  )

  return {
    exports: exportRecords,
    notification,
    createExport,
    downloadExport,
  }
}

export type DataExportsState = ReturnType<typeof useDataExports>
