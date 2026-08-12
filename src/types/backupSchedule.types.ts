import type { SourceScope } from './sourceScope.types'

export type BackupScheduleFrequency = 'daily' | 'weekly'

export interface BackupSchedule {
  id: string
  name: string
  sourceId: string
  scopes: SourceScope[]
  frequency: BackupScheduleFrequency
  time: string
  weekday: number | null
  isActive: boolean
  createdAt: string
}

export interface CreateBackupScheduleInput {
  name: string
  sourceId: string
  scopes: SourceScope[]
  frequency: BackupScheduleFrequency
  time: string
  weekday: number | null
}

export const BACKUP_SCHEDULE_FREQUENCY_LABELS: Record<BackupScheduleFrequency, string> = {
  daily: 'Tous les jours',
  weekly: 'Toutes les semaines',
}

export const BACKUP_SCHEDULE_WEEKDAYS = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
] as const

export const DEFAULT_SCHEDULE_TIME = '02:00'
