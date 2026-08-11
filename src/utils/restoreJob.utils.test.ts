import {
  filterRestoreBackupsByTarget,
  formatRestoreBackupSource,
  formatRestoreProgress,
  validateCreateRestoreJobInput,
} from './restoreJob.utils'

describe('restoreJob.utils', () => {
  const backups = [
    {
      id: 'BAK-1001',
      name: 'Sauvegarde Pistes & Contacts',
      date: '2026-08-01T08:00:00Z',
      source: 'Salesforce Production Core',
      sourceId: 'src-1',
    },
    {
      id: 'BAK-1002',
      name: 'Sauvegarde Staging',
      date: '2026-08-02T08:00:00Z',
      source: 'Salesforce Staging Sandbox',
      sourceId: 'src-2',
    },
  ]

  const targets = [{ id: 'src-1', name: 'Salesforce Production Core (Production)' }]

  it('formats restore progress', () => {
    expect(formatRestoreProgress(1450, 1450)).toBe('1\u202f450 / 1\u202f450 objets')
  })

  it('formats backup source label', () => {
    expect(formatRestoreBackupSource('2026-08-01T08:00:00Z')).toContain('Backup du')
    expect(formatRestoreBackupSource('2026-08-01T08:00:00Z', 'Sauvegarde Pistes & Contacts')).toContain(
      'Sauvegarde Pistes & Contacts',
    )
  })

  it('filters backups by target source', () => {
    expect(filterRestoreBackupsByTarget(backups, 'src-1')).toHaveLength(1)
    expect(filterRestoreBackupsByTarget(backups, 'src-1')[0].id).toBe('BAK-1001')
    expect(filterRestoreBackupsByTarget(backups, 'src-2')).toHaveLength(1)
    expect(filterRestoreBackupsByTarget(backups, '')).toHaveLength(0)
  })

  it('validates restore job input', () => {
    expect(
      validateCreateRestoreJobInput(
        {
          name: 'Restauration Pistes & Contacts',
          backupId: 'BAK-1001',
          targetSourceId: 'src-1',
        },
        backups,
        targets,
      ),
    ).toBeNull()

    expect(
      validateCreateRestoreJobInput(
        { name: '', backupId: 'BAK-1001', targetSourceId: 'src-1' },
        backups,
        targets,
      ),
    ).not.toBeNull()

    expect(
      validateCreateRestoreJobInput(
        {
          name: 'Restauration incompatible',
          backupId: 'BAK-1002',
          targetSourceId: 'src-1',
        },
        backups,
        targets,
      ),
    ).toBe('Cette sauvegarde ne correspond pas à la cible sélectionnée.')

    expect(
      validateCreateRestoreJobInput(
        {
          name: 'Reload Contacts',
          backupId: 'BAK-1001',
          targetSourceId: 'src-1',
        },
        backups,
        targets,
      ),
    ).toBeNull()
  })
})
