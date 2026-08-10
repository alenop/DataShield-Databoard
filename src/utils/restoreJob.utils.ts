import i18n from '../i18n'
import type {
  CreateRestoreJobInput,
  RestoreBackupOption,
  RestoreJob,
  RestoreTargetOption,
} from '../types/restoreJob.types'

export function formatRestoreProgress(restoredCount: number, totalCount: number): string {
  const formatCount = (value: number) => value.toLocaleString(i18n.language)
  return i18n.t('common.restoreProgress', {
    restored: formatCount(restoredCount),
    total: formatCount(totalCount),
  })
}

export function formatRestoreBackupSource(backupDate: string, backupName?: string): string {
  const dateLabel = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(backupDate))

  if (!backupName) return i18n.t('common.backupFrom', { date: dateLabel })
  return i18n.t('common.backupFromWithName', { date: dateLabel, name: backupName })
}

export function filterRestoreBackupsByTarget(
  backups: RestoreBackupOption[],
  targetSourceId: string,
): RestoreBackupOption[] {
  if (!targetSourceId) return []
  return backups.filter((backup) => backup.sourceId === targetSourceId)
}

export function validateCreateRestoreJobInput(
  input: CreateRestoreJobInput,
  existingNames: string[],
  backups: RestoreBackupOption[],
  targets: RestoreTargetOption[],
): string | null {
  const name = input.name.trim()
  if (!name) return i18n.t('validation.restoreNameRequired')
  if (name.length < 3) return i18n.t('validation.scheduleNameMinLength')

  if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    return i18n.t('validation.restoreNameDuplicate')
  }

  if (!backups.some((backup) => backup.id === input.backupId)) {
    return i18n.t('validation.backupInvalid')
  }

  const selectedBackup = backups.find((backup) => backup.id === input.backupId)
  if (selectedBackup && selectedBackup.sourceId !== input.targetSourceId) {
    return i18n.t('validation.backupTargetMismatch')
  }

  if (!targets.some((target) => target.id === input.targetSourceId)) {
    return i18n.t('validation.restoreTargetInvalid')
  }

  return null
}

export function simulateRestoreTotalCount(): number {
  const min = 400
  const max = 2500
  return Math.round(min + Math.random() * (max - min))
}

export function createRestoreJob(
  input: CreateRestoreJobInput,
  backup: RestoreBackupOption,
): RestoreJob {
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    backupId: backup.id,
    backupName: backup.name,
    backupDate: backup.date,
    targetSourceId: input.targetSourceId,
    status: 'in_progress',
    restoredCount: 0,
    totalCount: simulateRestoreTotalCount(),
    createdAt: new Date().toISOString(),
  }
}

export function parseStoredRestoreJobs(
  stored: string | null,
  fallback: RestoreJob[],
): RestoreJob[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map(normalizeRestoreJob)
      .filter((item): item is RestoreJob => item !== null)

    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

function isRestoreJobStatus(value: string): value is RestoreJob['status'] {
  return value === 'success' || value === 'in_progress' || value === 'failure'
}

function normalizeRestoreJob(raw: unknown): RestoreJob | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<RestoreJob>
  const name = record.name?.trim()
  const backupId = record.backupId?.trim()
  const backupName = record.backupName?.trim()
  const backupDate = record.backupDate?.trim()
  const targetSourceId = record.targetSourceId?.trim()
  const createdAt = record.createdAt?.trim()

  if (!name || !backupId || !backupName || !backupDate || !targetSourceId || !createdAt) {
    return null
  }

  const status =
    record.status && isRestoreJobStatus(record.status) ? record.status : 'success'
  const totalCount = typeof record.totalCount === 'number' ? record.totalCount : 0
  const restoredCount =
    typeof record.restoredCount === 'number' ? record.restoredCount : totalCount

  return {
    id: record.id?.trim() || crypto.randomUUID(),
    name,
    backupId,
    backupName,
    backupDate,
    targetSourceId,
    status,
    restoredCount,
    totalCount,
    createdAt,
    errorMessage: record.errorMessage?.trim(),
  }
}
