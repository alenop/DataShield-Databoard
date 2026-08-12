import {
  createBackupSchedule,
  formatScheduleDescription,
  validateCreateBackupScheduleInput,
} from './backupSchedule.utils'
import type { BackupSource } from '../types/backupSource.types'

const sources: BackupSource[] = [
  {
    id: 'src-1',
    name: 'Source 1',
    environment: 'Production',
    apiEndpoint: 'https://example.com',
    status: 'CONNECTED',
    scopes: ['contacts', 'accounts'],
  },
]

describe('backupSchedule.utils', () => {
  it('formats daily and weekly schedules', () => {
    expect(
      formatScheduleDescription({
        id: '1',
        name: 'Daily',
        sourceId: 'src-1',
        scopes: ['contacts'],
        frequency: 'daily',
        time: '02:00',
        weekday: null,
        isActive: true,
        createdAt: '2026-08-01T00:00:00',
      }),
    ).toBe('Tous les jours à 02:00')

    expect(
      formatScheduleDescription({
        id: '2',
        name: 'Weekly',
        sourceId: 'src-1',
        scopes: ['full'],
        frequency: 'weekly',
        time: '03:00',
        weekday: 0,
        isActive: true,
        createdAt: '2026-08-01T00:00:00',
      }),
    ).toBe('Tous les dimanches à 03:00')
  })

  it('validates schedule input with scopes', () => {
    expect(
      validateCreateBackupScheduleInput(
        {
          name: 'Planif CRM',
          sourceId: 'src-1',
          scopes: ['contacts', 'accounts'],
          frequency: 'daily',
          time: '02:00',
          weekday: null,
        },
        [],
        sources,
      ),
    ).toBeNull()
  })

  it('creates a schedule with weekday only for weekly frequency', () => {
    const schedule = createBackupSchedule({
      name: 'Weekly backup',
      sourceId: 'src-1',
      scopes: ['contacts'],
      frequency: 'weekly',
      time: '03:00',
      weekday: 1,
    })

    expect(schedule.frequency).toBe('weekly')
    expect(schedule.weekday).toBe(1)
    expect(schedule.scopes).toEqual(['contacts'])
  })
})
