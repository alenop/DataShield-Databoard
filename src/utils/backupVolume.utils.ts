import type { BackupRecord, BackupVolumePoint } from '../types/backup.types'

const BACKUP_VOLUME_STATUSES: BackupRecord['status'][] = ['success', 'in_progress']

function startOfDay(date: Date): Date {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatVolumeDayLabel(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function roundVolumeGb(value: number): number {
  return Math.round(value * 10) / 10
}

export function buildBackupVolumeFromRecords(
  records: BackupRecord[],
  days = 7,
  referenceDate: Date = new Date(),
): BackupVolumePoint[] {
  const today = startOfDay(referenceDate)
  const relevantRecords = records.filter((record) => BACKUP_VOLUME_STATUSES.includes(record.status))

  return Array.from({ length: days }, (_, index) => {
    const dayOffset = days - 1 - index
    const day = new Date(today)
    day.setDate(day.getDate() - dayOffset)

    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)

    const volumeGb = relevantRecords
      .filter((record) => {
        const backupDate = new Date(record.date)
        return backupDate >= day && backupDate < nextDay
      })
      .reduce((sum, record) => sum + record.sizeGb, 0)

    return {
      date: formatDateKey(day),
      label: formatVolumeDayLabel(day),
      volumeGb: roundVolumeGb(volumeGb),
    }
  })
}

export function sumSuccessfulBackupVolumeForDay(
  records: BackupRecord[],
  day: Date,
): number {
  const dayStart = startOfDay(day)
  const nextDay = new Date(dayStart)
  nextDay.setDate(nextDay.getDate() + 1)

  return records
    .filter((record) => BACKUP_VOLUME_STATUSES.includes(record.status))
    .filter((record) => {
      const backupDate = new Date(record.date)
      return backupDate >= dayStart && backupDate < nextDay
    })
    .reduce((sum, record) => sum + record.sizeGb, 0)
}
