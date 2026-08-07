export const BACKUP_SIMULATION_DURATION_MS = 8000
export const BACKUP_TICK_INTERVAL_MS = 1000
export const BACKUP_SIZE_INCREMENT_GB = 10
export const BACKUP_TARGET_SIZE_GB = 80
export const BACKUP_FAILURE_RATE = 0.2

export function shouldSimulateBackupFailure(): boolean {
  return Math.random() < BACKUP_FAILURE_RATE
}

export function getBackupProgressPercent(sizeGb: number): number {
  return Math.min(Math.round((sizeGb / BACKUP_TARGET_SIZE_GB) * 100), 100)
}

export function getLaunchSuccessNotification(sourceName: string): string {
  return `Sauvegarde terminée avec succès — ${sourceName}`
}

export function getLaunchFailureNotification(): string {
  return 'Échec de la sauvegarde : timeout de connexion au stockage distant'
}

export function getLaunchFailureDetails(): Pick<
  import('../types/backup.types').BackupRecord,
  'errorReason' | 'errorMessage'
> {
  return {
    errorReason: 'Timeout de connexion au stockage distant',
    errorMessage:
      'STORAGE_TIMEOUT : Le service de stockage n\'a pas répondu dans le délai imparti (30 s).',
  }
}
