import type {
  CreateRestoreJobInput,
  RestoreBackupOption,
  RestoreJob,
  RestoreTargetOption,
} from '../types/restoreJob.types'

export function formatRestoreProgress(restoredCount: number, totalCount: number): string {
  const formatCount = (value: number) => value.toLocaleString('fr-FR')
  return `${formatCount(restoredCount)} / ${formatCount(totalCount)} objets`
}

export function formatRestoreBackupSource(backupDate: string, backupName?: string): string {
  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(backupDate))

  if (!backupName) return `Backup du ${dateLabel}`
  return `Backup du ${dateLabel} — ${backupName}`
}

export function validateCreateRestoreJobInput(
  input: CreateRestoreJobInput,
  existingNames: string[],
  backups: RestoreBackupOption[],
  targets: RestoreTargetOption[],
): string | null {
  const name = input.name.trim()
  if (!name) return 'Le nom de la restauration est requis.'
  if (name.length < 3) return 'Le nom doit contenir au moins 3 caractères.'

  if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    return 'Une restauration avec ce nom existe déjà.'
  }

  if (!backups.some((backup) => backup.id === input.backupId)) {
    return 'Sauvegarde source invalide ou indisponible.'
  }

  if (!targets.some((target) => target.id === input.targetSourceId)) {
    return 'Cible de restauration invalide.'
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
