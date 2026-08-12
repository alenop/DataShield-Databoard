import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AuditEvent, AuditEventFilters } from '../types/audit.types'
import { DEFAULT_AUDIT_FILTERS } from '../types/audit.types'
import { AUDIT_EVENTS_STORAGE_KEY } from '../types/demoScenario.types'
import { buildDemoScenarioPack } from '../data/demoScenarios'
import {
  buildAuditActorOptions,
  filterAuditEventsByFilters,
  filterAuditEventsByQuery,
  hasActiveAuditFilters,
} from '../utils/auditFilters.utils'
import { sortAuditEventsByDateDesc } from '../utils/auditFormatters'
import { getAuditActionLabel, normalizeAuditEvents } from '../utils/auditLogger.utils'
import { getStoredDemoScenarioSelection } from '../utils/demoScenario.utils'

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
  const [filters, setFilters] = useState<AuditEventFilters>(DEFAULT_AUDIT_FILTERS)
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

  const actorOptions = useMemo(() => buildAuditActorOptions(sortedEvents), [sortedEvents])

  const filteredEvents = useMemo(() => {
    const byFilters = filterAuditEventsByFilters(sortedEvents, filters)
    return filterAuditEventsByQuery(byFilters, query, (event) => getAuditActionLabel(event, t))
  }, [sortedEvents, filters, query, t, i18n.language])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_AUDIT_FILTERS)
  }, [])

  const updateFilter = useCallback(
    <Key extends keyof AuditEventFilters>(key: Key, value: AuditEventFilters[Key]) => {
      setFilters((previous) => ({ ...previous, [key]: value }))
    },
    [],
  )

  return {
    events: filteredEvents,
    query,
    setQuery,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    hasActiveFilters: hasActiveAuditFilters(filters),
    actorOptions,
    totalCount: sortedEvents.length,
    filteredCount: filteredEvents.length,
    appendEvent,
  }
}

export type AuditEventsState = ReturnType<typeof useAuditEvents>
