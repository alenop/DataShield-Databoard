import { act, renderHook } from '@testing-library/react'
import { APP_SETTINGS_STORAGE_KEY, loadAppSettings, useAppSettings } from './useAppSettings'

describe('loadAppSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when nothing is stored', () => {
    expect(loadAppSettings()).toEqual({ confirmStopBackup: true })
  })

  it('loads stored settings', () => {
    localStorage.setItem(
      APP_SETTINGS_STORAGE_KEY,
      JSON.stringify({ confirmStopBackup: false }),
    )
    expect(loadAppSettings()).toEqual({ confirmStopBackup: false })
  })
})

describe('useAppSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('updates confirmStopBackup and persists to localStorage', () => {
    const { result } = renderHook(() => useAppSettings())

    act(() => {
      result.current.setConfirmStopBackup(false)
    })

    expect(result.current.settings.confirmStopBackup).toBe(false)
    expect(JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) ?? '{}')).toEqual({
      confirmStopBackup: false,
    })
  })
})
