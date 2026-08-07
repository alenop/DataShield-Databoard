import type { BackupRecord } from '../types/backup.types'

const RETRY_DELAY_MS = 3000

const RETRY_FAILURE = {
  errorReason: 'Échec de connexion au stockage distant',
  errorMessage:
    'STORAGE_TIMEOUT : Le service de stockage n\'a pas répondu dans le délai imparti (30 s).',
} as const

export function markBackupInProgress(record: BackupRecord): BackupRecord {
  return {
    ...record,
    status: 'in_progress',
    errorReason: undefined,
    errorMessage: undefined,
    date: new Date().toISOString(),
  }
}

export function resolveRetryOutcome(wasFailure: boolean): Pick<
  BackupRecord,
  'status' | 'errorReason' | 'errorMessage' | 'date'
> {
  if (wasFailure) {
    return {
      status: 'failure',
      date: new Date().toISOString(),
      ...RETRY_FAILURE,
    }
  }

  return {
    status: 'success',
    date: new Date().toISOString(),
    errorReason: undefined,
    errorMessage: undefined,
  }
}

export function getRetryDelayMs(): number {
  return RETRY_DELAY_MS
}

export function resolveUserStoppedOutcome(username: string): Pick<
  BackupRecord,
  'status' | 'errorReason' | 'errorMessage' | 'date'
> {
  return {
    status: 'failure',
    date: new Date().toISOString(),
    errorReason: 'Sauvegarde annulée',
    errorMessage: `Arrêtée par l'utilisateur : ${username}`,
  }
}
