import { act, renderHook } from '@testing-library/react'
import type { BackupRecord } from '../types/backup.types'
import { useBackupFilters } from './useBackupFilters'

const records: BackupRecord[] = [
  {
    id: '1',
    name: 'A',
    sourceId: 'src-1',
    source: 'S1',
    date: '2026-08-07T06:00:00',
    sizeGb: 10,
    status: 'success',
    durationMinutes: 10,
    scopes: ['full'],
  },
  {
    id: '2',
    name: 'B',
    sourceId: 'src-2',
    source: 'S2',
    date: '2026-08-07T07:00:00',
    sizeGb: 5,
    status: 'failure',
    durationMinutes: 5,
    scopes: ['contacts'],
  },
]

describe('useBackupFilters', () => {
  it('returns all records by default', () => {
    const { result } = renderHook(() => useBackupFilters({ records }))
    expect(result.current.filteredRecords).toHaveLength(2)
    expect(result.current.statusFilter).toBe('all')
  })

  it('filters records when status changes', () => {
    const { result } = renderHook(() => useBackupFilters({ records }))

    act(() => {
      result.current.setStatusFilter('failure')
    })

    expect(result.current.filteredRecords).toHaveLength(1)
    expect(result.current.filteredRecords[0].status).toBe('failure')
  })

  it('computes status counts', () => {
    const { result } = renderHook(() => useBackupFilters({ records }))
    expect(result.current.statusCounts).toEqual({
      all: 2,
      success: 1,
      in_progress: 0,
      failure: 1,
    })
  })
})
