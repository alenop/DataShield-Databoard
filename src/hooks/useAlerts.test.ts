import { act, renderHook } from '@testing-library/react'
import { ALERTS_STORAGE_KEY, useAlerts } from './useAlerts'

describe('useAlerts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads default alerts and summary', () => {
    const { result } = renderHook(() => useAlerts())

    expect(result.current.alerts.length).toBeGreaterThan(0)
    expect(result.current.summary.critical).toBeGreaterThan(0)
  })

  it('marks an alert as resolved', () => {
    const { result } = renderHook(() => useAlerts())
    const activeAlert = result.current.alerts.find((alert) => alert.status === 'active')
    expect(activeAlert).toBeDefined()

    act(() => {
      const error = result.current.markAsResolved(activeAlert!.id)
      expect(error).toBeNull()
    })

    const updated = result.current.alerts.find((alert) => alert.id === activeAlert!.id)
    expect(updated?.status).toBe('resolved')
    expect(result.current.summary.resolved).toBeGreaterThan(0)
    expect(result.current.notification?.message).toContain('résolue')
  })

  it('filters alerts by severity when a summary card is toggled', () => {
    const { result } = renderHook(() => useAlerts())

    act(() => {
      result.current.toggleSeverityFilter('critical')
    })

    expect(result.current.severityFilter).toBe('critical')
    expect(result.current.alerts.every((alert) => alert.severity === 'critical')).toBe(true)
    expect(result.current.alerts.every((alert) => alert.status === 'active')).toBe(true)

    act(() => {
      result.current.toggleSeverityFilter('critical')
    })

    expect(result.current.severityFilter).toBe('all')
  })

  it('persists alerts to localStorage', () => {
    const { result } = renderHook(() => useAlerts())
    const activeAlert = result.current.alerts.find((alert) => alert.status === 'active')

    act(() => {
      result.current.markAsResolved(activeAlert!.id)
    })

    const stored = JSON.parse(localStorage.getItem(ALERTS_STORAGE_KEY) ?? '[]')
    expect(
      stored.some(
        (alert: { id: string; status: string }) =>
          alert.id === activeAlert!.id && alert.status === 'resolved',
      ),
    ).toBe(true)
  })
})
