import type { BackupRecord, BackupVolumePoint } from '../types/backup.types'

export const mockBackupRecords: BackupRecord[] = [
  {
    id: 'BAK-1001',
    name: 'Sauvegarde Pistes & Contacts',
    source: 'Salesforce Production',
    date: '2026-08-07T12:00:00Z',
    sizeGb: 142.5,
    status: 'success',
    durationMinutes: 45,
    description: 'Export complet des objets Piste et Contact avec pièces jointes.',
  },
  {
    id: 'BAK-1002',
    name: 'Archivage Tickets Service Cloud',
    source: 'Salesforce Staging',
    date: '2026-08-07T11:30:00Z',
    sizeGb: 88.0,
    status: 'failure',
    durationMinutes: 12,
    description: 'Archivage incrémental des tickets Case des 30 derniers jours.',
    errorReason: 'Quota API Salesforce dépassé',
    errorMessage:
      'API_LIMIT_EXCEEDED : Daily API request limit exceeded (150 000/150 000). Réessayez après 00:00 UTC.',
  },
  {
    id: 'BAK-1003',
    name: 'Export Général Marketing Cloud',
    source: 'Salesforce Production',
    date: '2026-08-07T14:15:00Z',
    sizeGb: 310.2,
    status: 'in_progress',
    durationMinutes: 25,
    description: 'Synchronisation des abonnés et des parcours Journey Builder.',
  },
  {
    id: 'BAK-1004',
    name: 'Sauvegarde Rôles & Permissions',
    source: 'Salesforce Sandbox',
    date: '2026-08-06T23:00:00Z',
    sizeGb: 4.8,
    status: 'success',
    durationMinutes: 3,
    description: 'Snapshot des profils, rôles et ensembles d\'autorisations.',
  },
  {
    id: 'BAK-1005',
    name: 'Synchro Données Métriques ERP',
    source: 'External API',
    date: '2026-08-06T18:45:00Z',
    sizeGb: 52.1,
    status: 'failure',
    durationMinutes: 18,
    description: 'Import des métriques financières depuis l\'ERP externe.',
    errorReason: 'Timeout de connexion au stockage distant',
    errorMessage:
      'STORAGE_TIMEOUT : Le bucket S3 « datashield-backups-prod » n\'a pas répondu après 30 secondes.',
  },
]

export const mockBackupVolume: BackupVolumePoint[] = [
  { date: '2026-08-01', label: '1 Aug', volumeGb: 410 },
  { date: '2026-08-02', label: '2 Aug', volumeGb: 435 },
  { date: '2026-08-03', label: '3 Aug', volumeGb: 420 },
  { date: '2026-08-04', label: '4 Aug', volumeGb: 490 },
  { date: '2026-08-05', label: '5 Aug', volumeGb: 510 },
  { date: '2026-08-06', label: '6 Aug', volumeGb: 580 },
  { date: '2026-08-07', label: '7 Aug', volumeGb: 597 },
]
