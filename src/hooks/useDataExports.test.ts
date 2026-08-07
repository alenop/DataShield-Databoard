import { act, renderHook } from '@testing-library/react'
import { EXPORTS_STORAGE_KEY, useDataExports } from './useDataExports'

describe('useDataExports', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const sources = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      scopes: ['Contacts', 'Opportunités'],
    },
  ]

  it('loads default exports', () => {
    const { result } = renderHook(() => useDataExports(sources))
    expect(result.current.exports.length).toBeGreaterThan(0)
  })

  it('creates a preparing export that becomes ready', () => {
    const { result } = renderHook(() => useDataExports(sources))
    const initialCount = result.current.exports.length

    act(() => {
      const error = result.current.createExport({
        name: 'Export_Test_Q3.csv',
        format: 'csv',
        sourceId: sources[0].id,
        scope: 'Contacts',
        exportDate: '2026-08-07',
      })
      expect(error).toBeNull()
    })

    expect(result.current.exports).toHaveLength(initialCount + 1)
    expect(result.current.exports[0].status).toBe('preparing')
    expect(result.current.exports[0].scope).toBe('Contacts')

    act(() => {
      jest.advanceTimersByTime(6000)
    })

    expect(result.current.exports[0].status).toBe('ready')
    expect(result.current.exports[0].sizeBytes).toBeGreaterThan(0)
  })

  it('allows download only for ready exports', () => {
    const { result } = renderHook(() => useDataExports(sources))
    const readyExport = result.current.exports.find((item) => item.status === 'ready')
    expect(readyExport).toBeDefined()

    act(() => {
      const error = result.current.downloadExport(readyExport!.id)
      expect(error).toBeNull()
    })

    expect(result.current.notification?.message).toContain('Téléchargement sécurisé')
  })

  it('persists exports to localStorage', () => {
    const { result } = renderHook(() => useDataExports(sources))

    act(() => {
      result.current.createExport({
        name: 'Export_Persist',
        format: 'json',
        sourceId: sources[0].id,
        scope: 'Contacts',
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
