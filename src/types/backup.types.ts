import type { SourceScope } from './sourceScope.types'

export type BackupStatus = 'success' | 'in_progress' | 'failure'
export type BackupStatusFilter = BackupStatus | 'all'

export type BackupScheduleFrequency = 'daily' | 'weekly'

export interface BackupRecord {
  id: string
  name: string
  sourceId: string
  source: string
  date: string
  sizeGb: number
  status: BackupStatus
  durationMinutes: number
  scheduleFrequency?: BackupScheduleFrequency | null
  scheduleId?: string
  scopes: SourceScope[]
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

export const backupScheduleFrequencyShortLabels: Record<BackupScheduleFrequency, string> = {
  daily: 'j',
  weekly: 's',
}

export const backupScheduleFrequencyTypeLabels: Record<BackupScheduleFrequency, string> = {
  daily: 'Quotidienne',
  weekly: 'Hebdomadaire',
}
