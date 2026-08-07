import { useMemo, useState } from 'react'
import { mockAuditEvents } from '../data/mockAuditEvents'
import { filterAuditEventsByQuery } from '../utils/auditFilters.utils'
import { sortAuditEventsByDateDesc } from '../utils/auditFormatters'

export function useAuditEvents() {
  const [query, setQuery] = useState('')

  const events = useMemo(() => sortAuditEventsByDateDesc(mockAuditEvents), [])

  const filteredEvents = useMemo(
    () => filterAuditEventsByQuery(events, query),
    [events, query],
  )

  return {
    events: filteredEvents,
    query,
    setQuery,
    totalCount: events.length,
    filteredCount: filteredEvents.length,
  }
}

export type AuditEventsState = ReturnType<typeof useAuditEvents>
