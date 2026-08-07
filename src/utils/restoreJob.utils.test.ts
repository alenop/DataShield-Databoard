import {
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
      source: 'Salesforce Production',
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

  it('validates restore job input', () => {
    expect(
      validateCreateRestoreJobInput(
        {
          name: 'Restauration Pistes & Contacts',
          backupId: 'BAK-1001',
          targetSourceId: 'src-1',
        },
        [],
        backups,
        targets,
      ),
    ).toBeNull()

    expect(
      validateCreateRestoreJobInput(
        { name: '', backupId: 'BAK-1001', targetSourceId: 'src-1' },
        [],
        backups,
        targets,
      ),
    ).not.toBeNull()
  })
})
