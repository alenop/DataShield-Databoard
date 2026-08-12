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

  it('allows launching multiple restores with the same name', () => {
    const { result } = renderHook(() => useRestoreJobs(hookOptions))
    const sharedName = 'Reload Contacts'

    act(() => {
      expect(
        result.current.launchRestore({
          name: sharedName,
          backupId: 'BAK-1001',
          targetSourceId: 'src-1',
        }),
      ).toBeNull()
    })

    act(() => {
      jest.advanceTimersByTime(8000)
    })

    act(() => {
      expect(
        result.current.launchRestore({
          name: sharedName,
          backupId: 'BAK-1001',
          targetSourceId: 'src-1',
        }),
      ).toBeNull()
    })

    expect(result.current.restoreJobs.filter((job) => job.name === sharedName)).toHaveLength(2)
  })

  it('logs audit events when a restore is triggered and completed', () => {
    localStorage.setItem(
      RESTORE_JOBS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
          name: 'Restauration Pistes & Contacts',
          backupId: 'BAK-1001',
          backupName: 'Sauvegarde Pistes & Contacts',
          backupDate: '2026-08-01T08:00:00Z',
          targetSourceId: 'src-1',
          status: 'success',
          restoredCount: 1450,
          totalCount: 1450,
          createdAt: '2026-08-07T09:30:00',
        },
      ]),
    )

    const logAudit = jest.fn()
    const { result } = renderHook(() => useRestoreJobs({ ...hookOptions, logAudit }))

    act(() => {
      result.current.launchRestore({
        name: 'Restauration Audit',
        backupId: 'BAK-1001',
        targetSourceId: 'src-1',
      })
    })

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ actionCode: 'RESTORE_JOB_TRIGGERED' }),
    )

    act(() => {
      jest.advanceTimersByTime(8000)
    })

    expect(result.current.restoreJobs[0].status).toBe('success')
    expect(result.current.notification?.message).toContain('Restauration Audit')

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ actionCode: 'RESTORE_JOB_COMPLETED' }),
    )
    expect(
      logAudit.mock.calls.filter(
        ([entry]) => entry.actionCode === 'RESTORE_JOB_COMPLETED',
      ),
    ).toHaveLength(1)
  })
})
