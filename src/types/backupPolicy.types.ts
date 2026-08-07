export interface BackupPolicy {
  id: string
  name: string
  cronExpression: string
  frequencyLabel: string
  retentionDays: number
  retentionLabel: string
  sourceIds: string[]
  isActive: boolean
}

export interface CreateBackupPolicyInput {
  name: string
  frequencyPresetId: string
  retentionDays: number
  sourceIds: string[]
}

export interface PolicyFrequencyPreset {
  id: string
  label: string
  cronExpression: string
}

export const POLICY_FREQUENCY_PRESETS: PolicyFrequencyPreset[] = [
  {
    id: 'daily-02',
    label: 'Tous les jours à 02:00',
    cronExpression: '0 2 * * *',
  },
  {
    id: 'every-4h',
    label: 'Toutes les 4 heures',
    cronExpression: '0 */4 * * *',
  },
  {
    id: 'weekly-sun-03',
    label: 'Tous les dimanches à 03:00',
    cronExpression: '0 3 * * 0',
  },
  {
    id: 'hourly',
    label: 'Toutes les heures',
    cronExpression: '0 * * * *',
  },
]

export const POLICY_RETENTION_PRESETS = [
  { days: 14, label: 'Conserver 14 jours' },
  { days: 30, label: 'Conserver 30 jours' },
  { days: 90, label: 'Conserver 90 jours' },
  { days: 365, label: 'Conserver 365 jours' },
  { days: 2555, label: 'Conserver 7 ans (rétention légale)' },
] as const
