import type { BackupRecord } from '../types/backup.types'
import {
  applyBackupFilters,
  countBackupStatuses,
  filterBackupRecords,
  filterBackupsBySource,
} from './backupFilters.utils'

const mockRecords: BackupRecord[] = [
  {
    id: '1',
    name: 'Backup A',
    sourceId: 'src-1',
    source: 'SQL-01',
    date: '2026-08-07T06:00:00',
    sizeGb: 10,
    status: 'success',
    durationMinutes: 15,
  },
  {
    id: '2',
    name: 'Backup B',
    sourceId: 'src-2',
    source: 'SQL-02',
    date: '2026-08-07T07:00:00',
    sizeGb: 5,
    status: 'failure',
    durationMinutes: 4,
  },
  {
    id: '3',
    name: 'Backup C',
    sourceId: 'src-3',
    source: 'NAS',
    date: '2026-08-07T08:00:00',
    sizeGb: 20,
    status: 'in_progress',
    durationMinutes: 30,
  },
  {
    id: '4',
    name: 'Backup D',
    sourceId: 'src-4',
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

describe('filterBackupsBySource', () => {
  it('filters records by source query (case insensitive)', () => {
    const result = filterBackupsBySource(mockRecords, 'sql')
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.source.toLowerCase().includes('sql'))).toBe(true)
  })

  it('returns all records when query is empty', () => {
    expect(filterBackupsBySource(mockRecords, '')).toHaveLength(4)
    expect(filterBackupsBySource(mockRecords, '   ')).toHaveLength(4)
  })

  it('returns empty array when no source matches', () => {
    expect(filterBackupsBySource(mockRecords, 'unknown')).toEqual([])
  })
})

describe('applyBackupFilters', () => {
  it('combines status filter and source search', () => {
    const result = applyBackupFilters(mockRecords, 'success', 'sql')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})
