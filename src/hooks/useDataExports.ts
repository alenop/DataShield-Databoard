import { useCallback, useEffect, useRef, useState } from 'react'
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
            message: `Export « ${current.name} » prêt au téléchargement.`,
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
        message: `Export « ${created.name} » en cours de préparation…`,
        type: 'success',
      })
      return null
    },
    [exportRecords, sources, scheduleExportFinalization],
  )

  const downloadExport = useCallback(
    (exportId: string): string | null => {
      const item = exportRecords.find((record) => record.id === exportId)
      if (!item) return 'Export introuvable.'
      if (item.status === 'preparing') {
        setNotification({
          message: "L'export est encore en cours de préparation.",
          type: 'error',
        })
        return "L'export est encore en cours de préparation."
      }
      if (item.status === 'expired') {
        setNotification({
          message: 'Cet export a expiré et ne peut plus être téléchargé.',
          type: 'error',
        })
        return 'Cet export a expiré et ne peut plus être téléchargé.'
      }

      setNotification({
        message: `Téléchargement sécurisé lancé : ${item.name}`,
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
