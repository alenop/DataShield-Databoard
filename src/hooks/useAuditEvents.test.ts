import { act, renderHook } from '@testing-library/react'
import { useAuditEvents } from './useAuditEvents'

describe('useAuditEvents', () => {
  it('loads sorted audit events', () => {
    const { result } = renderHook(() => useAuditEvents())

    expect(result.current.totalCount).toBeGreaterThan(0)
    expect(result.current.events[0].timestamp >= result.current.events[1].timestamp).toBe(true)
  })

  it('filters events by query', () => {
    const { result } = renderHook(() => useAuditEvents())

    act(() => {
      result.current.setQuery('Système')
    })

    expect(result.current.filteredCount).toBeGreaterThan(0)
    expect(result.current.events.every((event) => event.actor.includes('Système'))).toBe(true)
  })
})
