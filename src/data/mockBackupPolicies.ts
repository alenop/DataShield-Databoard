import type { BackupPolicy } from '../types/backupPolicy.types'

export const mockBackupPolicies: BackupPolicy[] = [
  {
    id: 'p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    name: 'Sauvegarde Quotidienne Production',
    cronExpression: '0 2 * * *',
    frequencyLabel: 'Tous les jours à 02:00',
    retentionDays: 30,
    retentionLabel: 'Conserver 30 jours',
    sourceIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
    isActive: true,
  },
  {
    id: 'p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    name: 'Rétention Légale 7 ans',
    cronExpression: '0 3 * * 0',
    frequencyLabel: 'Tous les dimanches à 03:00',
    retentionDays: 2555,
    retentionLabel: 'Conserver 7 ans (rétention légale)',
    sourceIds: [
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'b14eebc9-9c0b-41f8-bb6d-6bb9bd380b22',
    ],
    isActive: true,
  },
  {
    id: 'p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    name: 'Sync Staging 4h',
    cronExpression: '0 */4 * * *',
    frequencyLabel: 'Toutes les 4 heures',
    retentionDays: 14,
    retentionLabel: 'Conserver 14 jours',
    sourceIds: ['b14eebc9-9c0b-41f8-bb6d-6bb9bd380b22'],
    isActive: false,
  },
]
