import { useCallback, useEffect, useState } from 'react'
import type { AppSettings } from '../types/settings.types'
import { defaultAppSettings } from '../types/settings.types'

export const APP_SETTINGS_STORAGE_KEY = 'datashield-settings'

export function loadAppSettings(): AppSettings {
  const stored = localStorage.getItem(APP_SETTINGS_STORAGE_KEY)
  if (!stored) return defaultAppSettings

  try {
    const parsed = JSON.parse(stored) as Partial<AppSettings>
    return { ...defaultAppSettings, ...parsed }
  } catch {
    return defaultAppSettings
  }
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings)

  useEffect(() => {
    localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const setConfirmStopBackup = useCallback((confirmStopBackup: boolean) => {
    setSettings((prev) => ({ ...prev, confirmStopBackup }))
  }, [])

  return {
    settings,
    setConfirmStopBackup,
  }
}

export type AppSettingsState = ReturnType<typeof useAppSettings>
