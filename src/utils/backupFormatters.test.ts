import type { TFunction } from 'i18next'
import {
  formatBackupDate,
  formatBackupDuration,
  formatBackupDisplayName,
  formatBackupSize,
} from './backupFormatters'

const mockT = ((key: string, options?: Record<string, unknown>) => {
  const translations: Record<string, string> = {
    'common.volumeUnit': 'Go',
    'common.durationMin': `${options?.count} min`,
    'common.durationHour': `${options?.hours} h`,
    'common.durationHourMin': `${options?.hours} h ${options?.minutes} min`,
    'common.dailyShort': 'j',
    'common.weeklyShort': 's',
  }
  return translations[key] ?? key
}) as TFunction

describe('formatBackupSize', () => {
  it('formats gigabytes with one decimal', () => {
    expect(formatBackupSize(42.567, mockT)).toBe('42.6 Go')
  })

  it('formats whole numbers', () => {
    expect(formatBackupSize(10, mockT)).toBe('10.0 Go')
  })
})

describe('formatBackupDuration', () => {
  it('formats minutes under 60', () => {
    expect(formatBackupDuration(45, mockT)).toBe('45 min')
  })

  it('formats exact hours', () => {
    expect(formatBackupDuration(120, mockT)).toBe('2 h')
  })

  it('formats hours and remaining minutes', () => {
    expect(formatBackupDuration(95, mockT)).toBe('1 h 35 min')
  })
})

describe('formatBackupDisplayName', () => {
  it('appends daily and weekly schedule markers', () => {
    expect(formatBackupDisplayName('Sauvegarde CRM', 'daily', mockT)).toBe('Sauvegarde CRM (j)')
    expect(formatBackupDisplayName('Sauvegarde CRM', 'weekly', mockT)).toBe('Sauvegarde CRM (s)')
  })

  it('returns the plain name for on-demand backups', () => {
    expect(formatBackupDisplayName('Sauvegarde CRM', null, mockT)).toBe('Sauvegarde CRM')
    expect(formatBackupDisplayName('Sauvegarde CRM', undefined, mockT)).toBe('Sauvegarde CRM')
  })
})

describe('formatBackupDate', () => {
  it('formats ISO date in French locale', () => {
    const formatted = formatBackupDate('2026-08-07T14:30:00')
    expect(formatted).toMatch(/07\/08\/2026/)
    expect(formatted).toMatch(/14:30/)
  })

  it('formats ISO date in English locale', () => {
    const formatted = formatBackupDate('2026-08-07T14:30:00', 'en')
    expect(formatted).toMatch(/08\/07\/2026/)
    expect(formatted).toMatch(/2:30/)
  })
})
