import { defaultBackupSources } from '../data/defaultBackupSources'
import type { BackupRecord } from '../types/backup.types'
import {
  buildRestoreBackupOptions,
  filterBackupsWithKnownSources,
  getBackupSourceLabel,
  resolveBackupSourceId,
} from './backupRecord.utils'

const productionSource = defaultBackupSources[0]
const stagingSource = defaultBackupSources[1]

const successfulProductionBackup: BackupRecord = {
  id: 'BAK-1001',
  name: 'Sauvegarde Production',
  sourceId: productionSource.id,
  source: productionSource.name,
  date: '2026-08-07T12:00:00Z',
  sizeGb: 10,
  status: 'success',
  durationMinutes: 5,
}

describe('backupRecord.utils', () => {
  it('resolves backup source id from sourceId field', () => {
    expect(resolveBackupSourceId(successfulProductionBackup, defaultBackupSources)).toBe(
      productionSource.id,
    )
  })

  it('falls back to source name only when sourceId is absent', () => {
    const legacyBackup: BackupRecord = {
      ...successfulProductionBackup,
      sourceId: '',
      source: productionSource.name,
    }

    expect(resolveBackupSourceId(legacyBackup, defaultBackupSources)).toBe(productionSource.id)
  })

  it('builds restore options only for successful backups linked to a source', () => {
    const records: BackupRecord[] = [
      successfulProductionBackup,
      {
        ...successfulProductionBackup,
        id: 'BAK-1002',
        sourceId: stagingSource.id,
        source: stagingSource.name,
        status: 'failure',
      },
      {
        ...successfulProductionBackup,
        id: 'BAK-1003',
        sourceId: 'unknown-id',
        source: 'Unknown Source',
        status: 'success',
      },
    ]

    const options = buildRestoreBackupOptions(records, defaultBackupSources)

    expect(options).toHaveLength(1)
    expect(options[0].id).toBe('BAK-1001')
    expect(options[0].sourceId).toBe(productionSource.id)
  })

  it('does not match by name when sourceId is invalid', () => {
    const orphanBackup: BackupRecord = {
      ...successfulProductionBackup,
      sourceId: 'unknown-id',
      source: productionSource.name,
    }

    expect(resolveBackupSourceId(orphanBackup, defaultBackupSources)).toBeUndefined()
  })

  it('uses current source name for display label', () => {
    const renamedSources = defaultBackupSources.map((source) =>
      source.id === productionSource.id
        ? { ...source, name: 'Salesforce Production Renamed' }
        : source,
    )

    expect(getBackupSourceLabel(successfulProductionBackup, renamedSources)).toBe(
      'Salesforce Production Renamed',
    )
  })

  it('hides orphan source labels', () => {
    expect(getBackupSourceLabel(successfulProductionBackup, [])).toBe('—')
  })

  it('filters out backups without a configured source', () => {
    const records: BackupRecord[] = [
      successfulProductionBackup,
      {
        ...successfulProductionBackup,
        id: 'BAK-orphan',
        sourceId: 'missing-id',
        source: 'Salesforce Production Core',
      },
    ]

    expect(filterBackupsWithKnownSources(records, defaultBackupSources)).toHaveLength(1)
    expect(filterBackupsWithKnownSources(records, defaultBackupSources)[0].id).toBe('BAK-1001')
  })
})
