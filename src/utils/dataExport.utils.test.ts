import {
  formatExportDate,
  formatExportSize,
  generateExportFileName,
  isValidExportDate,
  validateCreateExportInput,
} from './dataExport.utils'

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

  it('validates export input', () => {
    expect(
      validateCreateExportInput(
        {
          name: 'Export_Test.csv',
          format: 'csv',
          sourceId: 'src-1',
          scope: 'contacts',
          exportDate: '2026-08-07',
        },
        [],
        [{ id: 'src-1', scopes: ['contacts'] }],
      ),
    ).toBeNull()

    expect(
      validateCreateExportInput(
        { name: '', format: 'csv', sourceId: 'src-1', scope: 'contacts', exportDate: '2026-08-07' },
        [],
        [{ id: 'src-1', scopes: ['contacts'] }],
      ),
    ).not.toBeNull()

    expect(
      validateCreateExportInput(
        {
          name: 'Export_Test.csv',
          format: 'csv',
          sourceId: 'src-1',
          scope: 'leads',
          exportDate: '2026-08-07',
        },
        [],
        [{ id: 'src-1', scopes: ['contacts'] }],
      ),
    ).toBe('Périmètre invalide pour cette source.')
  })
})
