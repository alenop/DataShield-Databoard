export type RestoreJobStatus = 'success' | 'in_progress' | 'failure'

export interface RestoreJob {
  id: string
  name: string
  backupId: string
  backupName: string
  backupDate: string
  targetSourceId: string
  status: RestoreJobStatus
  restoredCount: number
  totalCount: number
  createdAt: string
  errorMessage?: string
}

export interface CreateRestoreJobInput {
  name: string
  backupId: string
  targetSourceId: string
}

export interface RestoreBackupOption {
  id: string
  name: string
  date: string
  source: string
}

export interface RestoreTargetOption {
  id: string
  name: string
}

export const restoreJobStatusLabels: Record<RestoreJobStatus, string> = {
  success: 'Succès',
  in_progress: 'En cours',
  failure: 'Échec',
}

export const RESTORE_SIMULATION_MS = 8000
export const RESTORE_PROGRESS_INTERVAL_MS = 400
