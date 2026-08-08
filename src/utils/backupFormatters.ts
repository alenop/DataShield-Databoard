import type { BackupScheduleFrequency } from '../types/backup.types'
import { backupScheduleFrequencyShortLabels } from '../types/backup.types'

export function formatBackupDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function formatBackupSize(gb: number): string {
  return `${gb.toFixed(1)} Go`
}

export function formatBackupDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`
}

export function formatBackupDisplayName(
  name: string,
  scheduleFrequency?: BackupScheduleFrequency | null,
): string {
  if (!scheduleFrequency) return name
  return `${name} (${backupScheduleFrequencyShortLabels[scheduleFrequency]})`
}
