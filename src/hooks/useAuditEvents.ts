import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AuditEvent } from '../types/audit.types'
import { AUDIT_EVENTS_STORAGE_KEY } from '../types/demoScenario.types'
import { buildDemoScenarioPack } from '../data/demoScenarios'
import { filterAuditEventsByQuery } from '../utils/auditFilters.utils'
import { sortAuditEventsByDateDesc } from '../utils/auditFormatters'
import {
  getStoredDemoScenarioSelection,
  loadAuditEventsFromStorage,
} from '../utils/demoScenario.utils'

function getAuditFallback(): AuditEvent[] {
  return buildDemoScenarioPack(getStoredDemoScenarioSelection()).auditEvents
}

export function useAuditEvents() {
  const [query, setQuery] = useState('')
  const [events, setEvents] = useState<AuditEvent[]>(() =>
    loadAuditEventsFromStorage(getAuditFallback()),
  )

  useEffect(() => {
    localStorage.setItem(AUDIT_EVENTS_STORAGE_KEY, JSON.stringify(events))
  }, [events])

  const appendEvent = useCallback((event: Omit<AuditEvent, 'id'>) => {
    setEvents((previous) => [
      {
        ...event,
        id: crypto.randomUUID(),
      },
      ...previous,
    ])
  }, [])

  const sortedEvents = useMemo(() => sortAuditEventsByDateDesc(events), [events])

  const filteredEvents = useMemo(
    () => filterAuditEventsByQuery(sortedEvents, query),
    [sortedEvents, query],
  )

  return {
    events: filteredEvents,
    query,
    setQuery,
    totalCount: sortedEvents.length,
    filteredCount: filteredEvents.length,
    appendEvent,
  }
}

export type AuditEventsState = ReturnType<typeof useAuditEvents>
