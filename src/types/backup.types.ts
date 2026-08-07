export type BackupStatus = 'success' | 'in_progress' | 'failure'

export type BackupStatusFilter = BackupStatus | 'all'

export interface BackupRecord {
  id: string
  name: string
  source: string
  date: string
  sizeGb: number
  status: BackupStatus
  durationMinutes: number
  description?: string
  errorReason?: string
  errorMessage?: string
}

export interface BackupVolumePoint {
  date: string
  label: string
  volumeGb: number
}

export const backupStatusLabels: Record<BackupStatus, string> = {
  success: 'Succès',
  in_progress: 'En cours',
  failure: 'Échec',
}
