import { act, renderHook } from '@testing-library/react'
import type { BackupSource } from '../types/backupSource.types'
import { useBackupSchedules } from './useBackupSchedules'

describe('useBackupSchedules', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const sources: BackupSource[] = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Salesforce Production Core',
      environment: 'Production',
      apiEndpoint: 'https://example.com',
      status: 'CONNECTED',
      scopes: ['contacts', 'accounts'],
    },
  ]

  it('creates a daily schedule', () => {
    const { result } = renderHook(() => useBackupSchedules(sources))

    act(() => {
      const error = result.current.createSchedule({
        name: 'Planif test',
        sourceId: sources[0].id,
        scopes: ['contacts'],
        frequency: 'daily',
        time: '02:00',
        weekday: null,
      })
      expect(error).toBeNull()
    })

    expect(result.current.schedules[0].frequency).toBe('daily')
    expect(result.current.schedules[0].scopes).toEqual(['contacts'])
    expect(result.current.notification?.message).toContain('Planif test')
  })

  it('toggles schedule active state', () => {
    const { result } = renderHook(() => useBackupSchedules(sources))
    const scheduleId = result.current.schedules[0].id

    act(() => {
      result.current.toggleScheduleActive(scheduleId)
    })

    expect(result.current.schedules.find((schedule) => schedule.id === scheduleId)?.isActive).toBe(
      false,
    )
  })
})
