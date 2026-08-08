import type { BackupSchedule } from '../types/backupSchedule.types'

export const mockBackupSchedules: BackupSchedule[] = [
  {
    id: 'sch-001',
    name: 'Sauvegarde quotidienne CRM',
    sourceId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    frequency: 'daily',
    time: '02:00',
    weekday: null,
    isActive: true,
    createdAt: '2026-07-01T08:00:00',
  },
  {
    id: 'sch-002',
    name: 'Sauvegarde hebdomadaire complète',
    sourceId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    frequency: 'weekly',
    time: '03:00',
    weekday: 0,
    isActive: true,
    createdAt: '2026-06-15T10:00:00',
  },
  {
    id: 'sch-003',
    name: 'Sync métriques ERP',
    sourceId: 'c24eebc9-9c0b-42f8-bb6d-6bb9bd380c33',
    frequency: 'daily',
    time: '04:30',
    weekday: null,
    isActive: false,
    createdAt: '2026-05-20T14:00:00',
  },
]
