import type { BackupRecord, BackupStatus, BackupScheduleFrequency } from '../types/backup.types'
import type { BackupSource } from '../types/backupSource.types'

export interface MockBackupTemplate {
  name: string
  daysAgo: number
  hour: number
  minute: number
  sizeGb: number
  status: BackupStatus
  durationMinutes: number
  scheduleFrequency?: BackupScheduleFrequency | null
  description: string
  errorReason?: string
  errorMessage?: string
  sourceIndex?: number
}

const MOCK_BACKUP_TEMPLATES: MockBackupTemplate[] = [
  {
    name: 'Sauvegarde Pistes & Contacts',
    daysAgo: 0,
    hour: 12,
    minute: 0,
    sizeGb: 142.5,
    status: 'success',
    durationMinutes: 45,
    scheduleFrequency: 'daily',
    description: 'Export complet des objets Piste et Contact avec pièces jointes.',
  },
  {
    name: 'Archivage Tickets Service Cloud',
    daysAgo: 0,
    hour: 11,
    minute: 30,
    sizeGb: 88.0,
    status: 'failure',
    durationMinutes: 12,
    scheduleFrequency: 'daily',
    description: 'Archivage incrémental des tickets Case des 30 derniers jours.',
    errorReason: 'Quota API Salesforce dépassé',
    errorMessage:
      'API_LIMIT_EXCEEDED : Daily API request limit exceeded (150 000/150 000). Réessayez après 00:00 UTC.',
  },
  {
    name: 'Export Général Marketing Cloud',
    daysAgo: 0,
    hour: 14,
    minute: 15,
    sizeGb: 310.2,
    status: 'in_progress',
    durationMinutes: 25,
    scheduleFrequency: null,
    description: 'Synchronisation des abonnés et des parcours Journey Builder.',
  },
  {
    name: 'Sauvegarde Rôles & Permissions',
    daysAgo: 1,
    hour: 23,
    minute: 0,
    sizeGb: 4.8,
    status: 'success',
    durationMinutes: 3,
    scheduleFrequency: 'weekly',
    description: "Snapshot des profils, rôles et ensembles d'autorisations.",
  },
  {
    name: 'Synchro Données Métriques ERP',
    daysAgo: 1,
    hour: 18,
    minute: 45,
    sizeGb: 52.1,
    status: 'failure',
    durationMinutes: 18,
    scheduleFrequency: 'daily',
    description: "Import des métriques financières depuis l'ERP externe.",
    errorReason: 'Timeout de connexion au stockage distant',
    errorMessage:
      "STORAGE_TIMEOUT : Le bucket S3 « datashield-backups-prod » n'a pas répondu après 30 secondes.",
  },
  {
    name: 'Sauvegarde Opportunités Q2',
    daysAgo: 2,
    hour: 6,
    minute: 0,
    sizeGb: 98.3,
    status: 'success',
    durationMinutes: 32,
    scheduleFrequency: 'daily',
    description: 'Export des opportunités clôturées au T2.',
  },
  {
    name: 'Sauvegarde Comptes Enterprise',
    daysAgo: 3,
    hour: 6,
    minute: 0,
    sizeGb: 76.4,
    status: 'success',
    durationMinutes: 28,
    scheduleFrequency: 'daily',
    description: 'Snapshot des comptes segment Enterprise.',
  },
  {
    name: 'Archivage Leads Marketing',
    daysAgo: 4,
    hour: 22,
    minute: 0,
    sizeGb: 12.7,
    status: 'success',
    durationMinutes: 8,
    scheduleFrequency: null,
    description: 'Archivage des leads campagne été 2026.',
  },
  {
    name: 'Sauvegarde Cases Support',
    daysAgo: 5,
    hour: 6,
    minute: 0,
    sizeGb: 54.2,
    status: 'success',
    durationMinutes: 19,
    scheduleFrequency: 'daily',
    description: 'Export des tickets support ouverts et résolus.',
  },
  {
    name: 'Sync Sandbox Config',
    daysAgo: 6,
    hour: 3,
    minute: 0,
    sizeGb: 3.1,
    status: 'success',
    durationMinutes: 2,
    scheduleFrequency: 'weekly',
    description: 'Synchronisation configuration sandbox.',
  },
  {
    name: 'Sauvegarde Métriques API',
    daysAgo: 7,
    hour: 4,
    minute: 0,
    sizeGb: 18.9,
    status: 'success',
    durationMinutes: 11,
    scheduleFrequency: 'daily',
    description: 'Collecte des métriques agrégées.',
  },
  {
    name: 'Sauvegarde Contacts VIP',
    daysAgo: 8,
    hour: 6,
    minute: 0,
    sizeGb: 22.5,
    status: 'success',
    durationMinutes: 9,
    scheduleFrequency: 'daily',
    description: 'Export contacts segment VIP.',
  },
  {
    name: 'Archivage Documents',
    daysAgo: 10,
    hour: 6,
    minute: 0,
    sizeGb: 210.8,
    status: 'success',
    durationMinutes: 55,
    scheduleFrequency: 'weekly',
    description: 'Archivage pièces jointes et ContentVersion.',
  },
  {
    name: 'Sauvegarde Staging Complète',
    daysAgo: 11,
    hour: 3,
    minute: 0,
    sizeGb: 45.6,
    status: 'failure',
    durationMinutes: 15,
    scheduleFrequency: 'weekly',
    description: 'Sauvegarde complète environnement staging.',
    errorReason: 'Token OAuth expiré',
    errorMessage: "AUTH_EXPIRED : Le jeton d'accès OAuth a expiré.",
  },
]

function buildBackupDate(referenceDate: Date, daysAgo: number, hour: number, minute: number): string {
  const date = new Date(referenceDate)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export function buildMockBackupRecords(
  sources: BackupSource[],
  referenceDate: Date = new Date(),
): BackupRecord[] {
  return buildBackupRecordsFromTemplates(MOCK_BACKUP_TEMPLATES, sources, referenceDate)
}

export function buildBackupRecordsFromTemplates(
  templates: MockBackupTemplate[],
  sources: BackupSource[],
  referenceDate: Date = new Date(),
): BackupRecord[] {
  if (sources.length === 0) return []

  return templates
    .map((template, index) => {
      const sourceIndex = template.sourceIndex ?? index % sources.length
      const source = sources[sourceIndex] ?? sources[0]

      return {
        id: `BAK-${1001 + index}`,
        name: template.name,
        sourceId: source.id,
        source: source.name,
        date: buildBackupDate(referenceDate, template.daysAgo, template.hour, template.minute),
        sizeGb: template.sizeGb,
        status: template.status,
        durationMinutes: template.durationMinutes,
        scheduleFrequency: template.scheduleFrequency ?? null,
        description: template.description,
        errorReason: template.errorReason,
        errorMessage: template.errorMessage,
      }
    })
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
}
