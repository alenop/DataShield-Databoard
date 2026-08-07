import { useCallback, useEffect, useState } from 'react'
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

  useEffect(() => {
    localStorage.setItem(BACKUP_SOURCES_STORAGE_KEY, JSON.stringify(sources))
  }, [sources])

  const addSource = useCallback((input: BackupSourceInput): string | null => {
    const error = validateBackupSourceInput(input)
    if (error) return error

    setSources((prev) => [...prev, createBackupSource(input)])
    return null
  }, [])

  const editSource = useCallback(
    (id: string, input: BackupSourceInput): string | null => {
      const error = validateBackupSourceInput(input)
      if (error) return error

      setSources((prev) =>
        prev.map((source) => (source.id === id ? updateBackupSource(source, input) : source)),
      )
      return null
    },
    [],
  )

  const deleteSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((source) => source.id !== id))
  }, [])

  const getSourceById = useCallback(
    (id: string) => sources.find((source) => source.id === id),
    [sources],
  )

  return {
    sources,
    addSource,
    editSource,
    deleteSource,
    getSourceById,
  }
}

export type BackupSourcesState = ReturnType<typeof useBackupSources>
