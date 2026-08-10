import type { TFunction } from 'i18next'
import type { BackupScheduleFrequency } from '../types/backup.types'

function resolveIntlLocale(language: string): string {
  if (language.startsWith('en')) return 'en-US'
  if (language.startsWith('fr')) return 'fr-FR'
  return language
}

export function formatBackupDate(isoDate: string, locale = 'fr-FR'): string {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function formatBackupSize(gb: number, t: TFunction): string {
  return `${gb.toFixed(1)} ${t('common.volumeUnit')}`
}

export function formatBackupDuration(minutes: number, t: TFunction): string {
  if (minutes < 60) return t('common.durationMin', { count: minutes })
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0
    ? t('common.durationHourMin', { hours, minutes: mins })
    : t('common.durationHour', { hours })
}

export function formatBackupDisplayName(
  name: string,
  scheduleFrequency: BackupScheduleFrequency | null | undefined,
  t: TFunction,
): string {
  if (!scheduleFrequency) return name
  const shortLabel =
    scheduleFrequency === 'daily' ? t('common.dailyShort') : t('common.weeklyShort')
  return `${name} (${shortLabel})`
}
