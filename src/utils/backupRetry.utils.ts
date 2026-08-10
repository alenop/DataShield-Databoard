import i18n from '../i18n'
import type { BackupRecord } from '../types/backup.types'

const RETRY_DELAY_MS = 3000

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
      errorReason: i18n.t('notifications.retryFailureReason'),
      errorMessage: i18n.t('notifications.backupFailureMessage'),
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
    errorReason: i18n.t('notifications.backupStoppedReason'),
    errorMessage: i18n.t('notifications.backupStoppedMessage', { username }),
  }
}
