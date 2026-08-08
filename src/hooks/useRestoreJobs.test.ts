import { act, renderHook } from '@testing-library/react'
import { RESTORE_JOBS_STORAGE_KEY, useRestoreJobs } from './useRestoreJobs'

describe('useRestoreJobs', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const availableBackups = [
    {
      id: 'BAK-1001',
      name: 'Sauvegarde Pistes & Contacts',
      date: '2026-08-01T08:00:00Z',
      source: 'Salesforce Production Core',
      sourceId: 'src-1',
    },
  ]

  const availableTargets = [{ id: 'src-1', name: 'Salesforce Production Core (Production)' }]

  const hookOptions = { availableBackups, availableTargets }

  it('loads default restore jobs', () => {
    const { result } = renderHook(() => useRestoreJobs(hookOptions))
    expect(result.current.restoreJobs.length).toBeGreaterThan(0)
  })

  it('launches a restore job that completes successfully', () => {
    const { result } = renderHook(() => useRestoreJobs(hookOptions))
    const initialCount = result.current.restoreJobs.length

    act(() => {
      const error = result.current.launchRestore({
        name: 'Restauration Test',
        backupId: 'BAK-1001',
        targetSourceId: 'src-1',
      })
      expect(error).toBeNull()
    })

    expect(result.current.restoreJobs).toHaveLength(initialCount + 1)
    expect(result.current.restoreJobs[0].status).toBe('in_progress')
    expect(result.current.restoreJobs[0].restoredCount).toBe(0)

    act(() => {
      jest.advanceTimersByTime(8000)
    })

    expect(result.current.restoreJobs[0].status).toBe('success')
    expect(result.current.restoreJobs[0].restoredCount).toBe(
      result.current.restoreJobs[0].totalCount,
    )
  })

  it('persists restore jobs to localStorage', () => {
    const { result } = renderHook(() => useRestoreJobs(hookOptions))

    act(() => {
      result.current.launchRestore({
        name: 'Restauration Persist',
        backupId: 'BAK-1001',
        targetSourceId: 'src-1',
      })
    })

    const stored = JSON.parse(localStorage.getItem(RESTORE_JOBS_STORAGE_KEY) ?? '[]')
    expect(stored.some((item: { name: string }) => item.name === 'Restauration Persist')).toBe(
      true,
    )
  })
})
