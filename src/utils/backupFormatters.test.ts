import {
  formatBackupDate,
  formatBackupDuration,
  formatBackupSize,
} from './backupFormatters'

describe('formatBackupSize', () => {
  it('formats gigabytes with one decimal', () => {
    expect(formatBackupSize(42.567)).toBe('42.6 Go')
  })

  it('formats whole numbers', () => {
    expect(formatBackupSize(10)).toBe('10.0 Go')
  })
})

describe('formatBackupDuration', () => {
  it('formats minutes under 60', () => {
    expect(formatBackupDuration(45)).toBe('45 min')
  })

  it('formats exact hours', () => {
    expect(formatBackupDuration(120)).toBe('2 h')
  })

  it('formats hours and remaining minutes', () => {
    expect(formatBackupDuration(95)).toBe('1 h 35 min')
  })
})

describe('formatBackupDate', () => {
  it('formats ISO date in French locale', () => {
    const formatted = formatBackupDate('2026-08-07T14:30:00')
    expect(formatted).toMatch(/07\/08\/2026/)
    expect(formatted).toMatch(/14:30/)
  })
})
