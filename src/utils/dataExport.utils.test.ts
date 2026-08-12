import {
  formatExportDate,
  formatExportSize,
  formatLinkExpiration,
  generateExportFileName,
  isValidExportDate,
  validateCreateExportInput,
} from './dataExport.utils'
import type { ExportBackupOption } from '../types/dataExport.types'

const backups: ExportBackupOption[] = [
  {
    id: 'BAK-1001',
    name: 'Backup Contacts',
    sourceId: 'src-1',
    sourceName: 'Source 1',
    date: '2026-08-07T06:00:00',
    scopes: ['contacts', 'accounts'],
  },
]

describe('dataExport.utils', () => {
  it('formats size in Go or Mo', () => {
    expect(formatExportSize(2.4 * 1024 ** 3)).toBe('2.4 Go')
    expect(formatExportSize(890 * 1024 ** 2)).toBe('890 Mo')
    expect(formatExportSize(0)).toBe('—')
  })

  it('generates file name with extension', () => {
    expect(generateExportFileName('Export_Contacts_Salesforce_Q2', 'csv')).toBe(
      'Export_Contacts_Salesforce_Q2.csv',
    )
  })

  it('validates export dates', () => {
    expect(isValidExportDate('2026-08-07')).toBe(true)
    expect(isValidExportDate('07/08/2026')).toBe(false)
  })

  it('formats export date for display', () => {
    expect(formatExportDate('2026-08-07')).toBe('07/08/2026')
  })

  it('formats link expiration based on status', () => {
    expect(formatLinkExpiration(null, 'preparing')).toBe('—')
    expect(formatLinkExpiration('2026-08-14T10:15:00', 'ready')).toBe('14/08/2026 10:15')
  })

  it('validates export input against backup scopes', () => {
    expect(
      validateCreateExportInput(
        {
          name: 'Export_Test.csv',
          format: 'csv',
          backupId: 'BAK-1001',
          scopes: ['contacts'],
          exportDate: '2026-08-07',
        },
        [],
        backups,
      ),
    ).toBeNull()

    expect(
      validateCreateExportInput(
        {
          name: '',
          format: 'csv',
          backupId: 'BAK-1001',
          scopes: ['contacts'],
          exportDate: '2026-08-07',
        },
        [],
        backups,
      ),
    ).not.toBeNull()

    expect(
      validateCreateExportInput(
        {
          name: 'Export_Test.csv',
          format: 'csv',
          backupId: 'BAK-1001',
          scopes: ['leads'],
          exportDate: '2026-08-07',
        },
        [],
        backups,
      ),
    ).toBe('Périmètre invalide pour cette sauvegarde.')
  })
})
