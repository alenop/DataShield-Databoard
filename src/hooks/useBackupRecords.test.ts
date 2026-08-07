import { act, renderHook } from '@testing-library/react'
import type { BackupRecord } from '../types/backup.types'
import * as backupSimulation from '../utils/backupSimulation.utils'
import { useBackupRecords } from './useBackupRecords'

const username = 'Admin Demo'

const records: BackupRecord[] = [
  {
    id: '1',
    name: 'Backup A',
    source: 'Salesforce Production',
    date: '2026-08-07T06:00:00',
    sizeGb: 10,
    status: 'failure',
    durationMinutes: 10,
    errorMessage: 'ERR_001',
  },
  {
    id: '2',
    name: 'Backup B',
    source: 'External API',
    date: '2026-08-07T07:00:00',
    sizeGb: 5,
    status: 'success',
    durationMinutes: 5,
  },
]

const hookOptions = { initialRecords: records, username }

describe('useBackupRecords', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('filters records by source search', () => {
    const { result } = renderHook(() => useBackupRecords(hookOptions))

    act(() => {
      result.current.setSourceQuery('salesforce')
    })

    expect(result.current.filteredRecords).toHaveLength(1)
    expect(result.current.filteredRecords[0].id).toBe('1')
  })

  it('selects and clears a backup', () => {
    const { result } = renderHook(() => useBackupRecords(hookOptions))

    act(() => {
      result.current.selectBackup('1')
    })

    expect(result.current.selectedBackup?.id).toBe('1')

    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.selectedBackup).toBeNull()
  })

  it('launches backup with in_progress state and progresses size over time', () => {
    jest.spyOn(backupSimulation, 'shouldSimulateBackupFailure').mockReturnValue(false)

    const { result } = renderHook(() => useBackupRecords(hookOptions))

    act(() => {
      result.current.launchBackup({
        name: 'New Backup',
        source: {
          id: 'src-1',
          name: 'Salesforce Production Core',
          environment: 'Production',
          apiEndpoint: 'https://example.com',
          status: 'CONNECTED',
          scopes: ['Contacts'],
        },
      })
    })

    expect(result.current.records[0].status).toBe('in_progress')
    expect(result.current.records[0].sizeGb).toBe(0)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(result.current.records[0].sizeGb).toBe(30)

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(result.current.records[0].status).toBe('success')
    expect(result.current.notification?.type).toBe('success')
  })

  it('finalizes retry as failure when simulation fails', () => {
    jest.spyOn(backupSimulation, 'shouldSimulateBackupFailure').mockReturnValue(true)

    const { result } = renderHook(() => useBackupRecords(hookOptions))

    act(() => {
      result.current.retryBackup('1')
    })

    expect(result.current.records.find((r) => r.id === '1')?.status).toBe('in_progress')

    act(() => {
      jest.advanceTimersByTime(8000)
    })

    const retried = result.current.records.find((r) => r.id === '1')
    expect(retried?.status).toBe('failure')
    expect(retried?.errorMessage).toBeDefined()
    expect(result.current.notification?.type).toBe('error')
  })

  it('does not retry a backup already in progress', () => {
    const inProgressRecords: BackupRecord[] = [
      { ...records[0], status: 'in_progress' },
    ]
    const { result } = renderHook(() =>
      useBackupRecords({ initialRecords: inProgressRecords, username }),
    )

    act(() => {
      result.current.retryBackup('1')
    })

    expect(result.current.records[0].status).toBe('in_progress')
  })

  it('stops an in-progress backup with user error message', () => {
    const inProgressRecords: BackupRecord[] = [
      { ...records[0], status: 'in_progress' },
    ]
    const { result } = renderHook(() =>
      useBackupRecords({ initialRecords: inProgressRecords, username }),
    )

    act(() => {
      result.current.stopBackup('1')
    })

    const stopped = result.current.records.find((r) => r.id === '1')
    expect(stopped?.status).toBe('failure')
    expect(stopped?.errorMessage).toBe("Arrêtée par l'utilisateur : Admin Demo")
  })

  it('cancels pending simulation when stopped', () => {
    jest.spyOn(backupSimulation, 'shouldSimulateBackupFailure').mockReturnValue(false)

    const { result } = renderHook(() => useBackupRecords(hookOptions))

    act(() => {
      result.current.retryBackup('1')
    })

    act(() => {
      result.current.stopBackup('1')
    })

    expect(result.current.records.find((r) => r.id === '1')?.errorMessage).toBe(
      "Arrêtée par l'utilisateur : Admin Demo",
    )

    act(() => {
      jest.advanceTimersByTime(8000)
    })

    expect(result.current.records.find((r) => r.id === '1')?.errorMessage).toBe(
      "Arrêtée par l'utilisateur : Admin Demo",
    )
  })

  it('does not stop a backup that is not in progress', () => {
    const { result } = renderHook(() => useBackupRecords(hookOptions))

    act(() => {
      result.current.stopBackup('2')
    })

    expect(result.current.records.find((r) => r.id === '2')?.status).toBe('success')
  })
})
