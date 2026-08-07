import { useCallback, useEffect, useState } from 'react'
import { postSourceConnectionTest } from '../api/sourceApi'
import { defaultBackupSources } from '../data/defaultBackupSources'
import type { BackupSource, BackupSourceInput } from '../types/backupSource.types'
import {
  createBackupSource,
  parseStoredBackupSources,
  updateBackupSource,
  validateBackupSourceInput,
} from '../utils/backupSource.utils'

export const BACKUP_SOURCES_STORAGE_KEY = 'datashield-backup-sources'

export function loadBackupSources(): BackupSource[] {
  const stored = localStorage.getItem(BACKUP_SOURCES_STORAGE_KEY)
  return parseStoredBackupSources(stored, defaultBackupSources)
}

export function useBackupSources() {
  const [sources, setSources] = useState<BackupSource[]>(loadBackupSources)
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    localStorage.setItem(BACKUP_SOURCES_STORAGE_KEY, JSON.stringify(sources))
  }, [sources])

  const addSource = useCallback((input: BackupSourceInput): string | null => {
    const error = validateBackupSourceInput(input)
    if (error) return error

    setSources((prev) => [...prev, createBackupSource(input)])
    return null
  }, [])

  const updateSource = useCallback((id: string, input: BackupSourceInput): string | null => {
    const error = validateBackupSourceInput(input)
    if (error) return error

    setSources((prev) =>
      prev.map((source) =>
        source.id === id ? updateBackupSource(source, input) : source,
      ),
    )
    return null
  }, [])

  const deleteSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((source) => source.id !== id))
  }, [])

  const getSourceById = useCallback(
    (id: string) => sources.find((source) => source.id === id),
    [sources],
  )

  const testConnection = useCallback(
    async (id: string) => {
      const source = sources.find((item) => item.id === id)
      if (!source || testingSourceId) return

      setTestingSourceId(id)

      try {
        const result = await postSourceConnectionTest(source)

        setSources((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: result.status } : item,
          ),
        )

        setNotification({
          message: result.message,
          type: result.status === 'CONNECTED' ? 'success' : 'error',
        })
      } finally {
        setTestingSourceId(null)
      }
    },
    [sources, testingSourceId],
  )

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  return {
    sources,
    testingSourceId,
    notification,
    addSource,
    updateSource,
    deleteSource,
    getSourceById,
    testConnection,
  }
}

export type BackupSourcesState = ReturnType<typeof useBackupSources>
