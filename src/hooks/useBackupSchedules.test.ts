import { act, renderHook } from '@testing-library/react'
import { useBackupSchedules } from './useBackupSchedules'

describe('useBackupSchedules', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const sourceIds = ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11']

  it('creates a daily schedule', () => {
    const { result } = renderHook(() => useBackupSchedules(sourceIds))

    act(() => {
      const error = result.current.createSchedule({
        name: 'Planif test',
        sourceId: sourceIds[0],
        frequency: 'daily',
        time: '02:00',
        weekday: null,
      })
      expect(error).toBeNull()
    })

    expect(result.current.schedules[0].frequency).toBe('daily')
    expect(result.current.notification?.message).toContain('Planif test')
  })

  it('toggles schedule active state', () => {
    const { result } = renderHook(() => useBackupSchedules(sourceIds))
    const scheduleId = result.current.schedules[0].id

    act(() => {
      result.current.toggleScheduleActive(scheduleId)
    })

    expect(result.current.schedules.find((schedule) => schedule.id === scheduleId)?.isActive).toBe(
      false,
    )
  })
})
