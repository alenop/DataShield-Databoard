import { act, renderHook } from '@testing-library/react'
import type { ExportBackupOption } from '../types/dataExport.types'
import { EXPORTS_STORAGE_KEY, useDataExports } from './useDataExports'

describe('useDataExports', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const backups: ExportBackupOption[] = [
    {
      id: 'BAK-1001',
      name: 'Backup Contacts',
      sourceId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      sourceName: 'Salesforce Production Core',
      date: '2026-08-07T06:00:00',
      scopes: ['contacts', 'opportunities'],
    },
  ]

  it('loads default exports', () => {
    const { result } = renderHook(() => useDataExports(backups))
    expect(result.current.exports.length).toBeGreaterThan(0)
  })

  it('creates a preparing export that becomes ready', () => {
    const { result } = renderHook(() => useDataExports(backups))
    const initialCount = result.current.exports.length

    act(() => {
      const error = result.current.createExport({
        name: 'Export_Test_Q3.csv',
        format: 'csv',
        backupId: backups[0].id,
        scopes: ['contacts'],
        exportDate: '2026-08-07',
      })
      expect(error).toBeNull()
    })

    expect(result.current.exports).toHaveLength(initialCount + 1)
    expect(result.current.exports[0].status).toBe('preparing')
    expect(result.current.exports[0].scopes).toEqual(['contacts'])
    expect(result.current.exports[0].backupId).toBe('BAK-1001')

    act(() => {
      jest.advanceTimersByTime(6000)
    })

    expect(result.current.exports[0].status).toBe('ready')
    expect(result.current.exports[0].sizeBytes).toBeGreaterThan(0)
  })

  it('allows download only for ready exports', () => {
    const { result } = renderHook(() => useDataExports(backups))
    const readyExport = result.current.exports.find((item) => item.status === 'ready')
    expect(readyExport).toBeDefined()

    act(() => {
      const error = result.current.downloadExport(readyExport!.id)
      expect(error).toBeNull()
    })

    expect(result.current.notification?.message).toContain('Téléchargement sécurisé')
  })

  it('persists exports to localStorage', () => {
    const { result } = renderHook(() => useDataExports(backups))

    act(() => {
      result.current.createExport({
        name: 'Export_Persist',
        format: 'json',
        backupId: backups[0].id,
        scopes: ['contacts'],
        exportDate: '2026-08-07',
      })
    })

    expect(result.current.exports[0].name).toBe('Export_Persist.json')

    const stored = JSON.parse(localStorage.getItem(EXPORTS_STORAGE_KEY) ?? '[]')
    expect(stored.some((item: { name: string }) => item.name === 'Export_Persist.json')).toBe(
      true,
    )
  })
})
