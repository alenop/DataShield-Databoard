import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AuditEvent } from '../types/audit.types'
import { AUDIT_EVENTS_STORAGE_KEY } from '../types/demoScenario.types'
import { buildDemoScenarioPack } from '../data/demoScenarios'
import { filterAuditEventsByQuery } from '../utils/auditFilters.utils'
import { sortAuditEventsByDateDesc } from '../utils/auditFormatters'
import { getAuditActionLabel, normalizeAuditEvents } from '../utils/auditLogger.utils'
import {
  getStoredDemoScenarioSelection,
} from '../utils/demoScenario.utils'

function getAuditFallback(): AuditEvent[] {
  return buildDemoScenarioPack(getStoredDemoScenarioSelection()).auditEvents
}

function loadNormalizedAuditEvents(): AuditEvent[] {
  const stored = localStorage.getItem(AUDIT_EVENTS_STORAGE_KEY)
  if (!stored) return getAuditFallback()

  try {
    const parsed: unknown = JSON.parse(stored)
    const normalized = normalizeAuditEvents(parsed)
    return normalized.length > 0 ? normalized : getAuditFallback()
  } catch {
    return getAuditFallback()
  }
}

export function useAuditEvents() {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [events, setEvents] = useState<AuditEvent[]>(loadNormalizedAuditEvents)

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
    () =>
      filterAuditEventsByQuery(sortedEvents, query, (event) => getAuditActionLabel(event, t)),
    [sortedEvents, query, t, i18n.language],
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
