import i18n from '../i18n'
import type {
  BackupSchedule,
  BackupScheduleFrequency,
  CreateBackupScheduleInput,
} from '../types/backupSchedule.types'

export function formatScheduleDescription(schedule: BackupSchedule): string {
  if (schedule.frequency === 'daily') {
    return i18n.t('common.scheduleDaily', { time: schedule.time })
  }

  const weekdayKey = String(schedule.weekday ?? 0)
  const weekday = i18n.t(`schedule.weekdays.${weekdayKey}`).toLowerCase()
  return i18n.t('common.scheduleWeekly', { weekday, time: schedule.time })
}

export function computeNextRunAt(schedule: BackupSchedule, fromDate = new Date()): Date {
  const [hours, minutes] = schedule.time.split(':').map(Number)
  const next = new Date(fromDate)
  next.setSeconds(0, 0)
  next.setHours(hours, minutes, 0, 0)

  if (schedule.frequency === 'daily') {
    if (next.getTime() <= fromDate.getTime()) {
      next.setDate(next.getDate() + 1)
    }
    return next
  }

  const targetWeekday = schedule.weekday ?? 0
  const currentWeekday = next.getDay()
  let daysUntil = (targetWeekday - currentWeekday + 7) % 7

  if (daysUntil === 0 && next.getTime() <= fromDate.getTime()) {
    daysUntil = 7
  }

  next.setDate(next.getDate() + daysUntil)
  return next
}

export function formatNextRunDate(schedule: BackupSchedule): string {
  if (!schedule.isActive) return i18n.t('common.scheduleDisabled')

  return new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(computeNextRunAt(schedule))
}

export function validateCreateBackupScheduleInput(
  input: CreateBackupScheduleInput,
  existingNames: string[],
  availableSourceIds: string[],
): string | null {
  const name = input.name.trim()
  if (!name) return i18n.t('validation.scheduleNameRequired')
  if (name.length < 3) return i18n.t('validation.scheduleNameMinLength')

  if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    return i18n.t('validation.scheduleNameDuplicate')
  }

  if (!availableSourceIds.includes(input.sourceId)) {
    return i18n.t('validation.invalidSource')
  }

  if (!/^\d{2}:\d{2}$/.test(input.time)) {
    return i18n.t('validation.invalidTime')
  }

  if (input.frequency === 'weekly' && (input.weekday === null || input.weekday < 0 || input.weekday > 6)) {
    return i18n.t('validation.weekdayRequired')
  }

  if (input.frequency === 'daily' && input.weekday !== null) {
    return i18n.t('validation.weekdayNotApplicable')
  }

  return null
}

export function createBackupSchedule(input: CreateBackupScheduleInput): BackupSchedule {
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    sourceId: input.sourceId,
    frequency: input.frequency,
    time: input.time,
    weekday: input.frequency === 'weekly' ? input.weekday : null,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
}

export function parseStoredBackupSchedules(
  stored: string | null,
  fallback: BackupSchedule[],
): BackupSchedule[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map(normalizeBackupSchedule)
      .filter((schedule): schedule is BackupSchedule => schedule !== null)

    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

function isScheduleFrequency(value: string): value is BackupScheduleFrequency {
  return value === 'daily' || value === 'weekly'
}

function normalizeBackupSchedule(raw: unknown): BackupSchedule | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<BackupSchedule>
  const name = record.name?.trim()
  const sourceId = record.sourceId?.trim()
  const time = record.time?.trim()
  const frequency = record.frequency
  const createdAt = record.createdAt?.trim()

  if (!name || !sourceId || !time || !frequency || !isScheduleFrequency(frequency) || !createdAt) {
    return null
  }

  return {
    id: record.id?.trim() || crypto.randomUUID(),
    name,
    sourceId,
    frequency,
    time,
    weekday: typeof record.weekday === 'number' ? record.weekday : null,
    isActive: record.isActive ?? true,
    createdAt,
  }
}
