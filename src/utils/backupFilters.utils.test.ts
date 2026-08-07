import type { BackupRecord } from '../types/backup.types'
import { countBackupStatuses, filterBackupRecords } from './backupFilters.utils'

const mockRecords: BackupRecord[] = [
  {
    id: '1',
    name: 'Backup A',
    source: 'SQL-01',
    date: '2026-08-07T06:00:00',
    sizeGb: 10,
    status: 'success',
    durationMinutes: 15,
  },
  {
    id: '2',
    name: 'Backup B',
    source: 'SQL-02',
    date: '2026-08-07T07:00:00',
    sizeGb: 5,
    status: 'failure',
    durationMinutes: 4,
  },
  {
    id: '3',
    name: 'Backup C',
    source: 'NAS',
    date: '2026-08-07T08:00:00',
    sizeGb: 20,
    status: 'in_progress',
    durationMinutes: 30,
  },
  {
    id: '4',
    name: 'Backup D',
    source: 'K8s',
    date: '2026-08-07T09:00:00',
    sizeGb: 8,
    status: 'success',
    durationMinutes: 12,
  },
]

describe('filterBackupRecords', () => {
  it('returns all records when filter is "all"', () => {
    expect(filterBackupRecords(mockRecords, 'all')).toHaveLength(4)
  })

  it('filters records by success status', () => {
    const result = filterBackupRecords(mockRecords, 'success')
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.status === 'success')).toBe(true)
  })

  it('filters records by failure status', () => {
    expect(filterBackupRecords(mockRecords, 'failure')).toHaveLength(1)
  })

  it('filters records by in_progress status', () => {
    expect(filterBackupRecords(mockRecords, 'in_progress')).toHaveLength(1)
  })

  it('returns empty array when no records match', () => {
    expect(filterBackupRecords([], 'success')).toEqual([])
  })
})

describe('countBackupStatuses', () => {
  it('counts all statuses correctly', () => {
    expect(countBackupStatuses(mockRecords)).toEqual({
      all: 4,
      success: 2,
      in_progress: 1,
      failure: 1,
    })
  })

  it('returns zero counts for empty records', () => {
    expect(countBackupStatuses([])).toEqual({
      all: 0,
      success: 0,
      in_progress: 0,
      failure: 0,
    })
  })
})
