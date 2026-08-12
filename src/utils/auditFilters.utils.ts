import type {
  AuditActionCode,
  AuditActorFilter,
  AuditActorOption,
  AuditDatePreset,
  AuditEvent,
  AuditEventFilters,
  AuditEventStatus,
  AuditSeverity,
} from '../types/audit.types'
import { auditEventStatusLabels } from '../types/audit.types'

export function filterAuditEventsByQuery(
  events: AuditEvent[],
  query: string,
  translateAction?: (event: AuditEvent) => string,
): AuditEvent[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return events

  return events.filter((event) => {
    const statusLabel = auditEventStatusLabels[event.status].toLowerCase()
    const actionLabel = translateAction
      ? translateAction(event).toLowerCase()
      : event.actionCode.toLowerCase()

    return (
      event.actor.toLowerCase().includes(normalized) ||
      (event.actorEmail?.toLowerCase().includes(normalized) ?? false) ||
      event.actionCode.toLowerCase().includes(normalized) ||
      actionLabel.includes(normalized) ||
      statusLabel.includes(normalized) ||
      event.severity.toLowerCase().includes(normalized) ||
      event.resourceType.toLowerCase().includes(normalized) ||
      Object.values(event.metadata ?? {}).some((value) =>
        value.toLowerCase().includes(normalized),
      )
    )
  })
}

export function getAuditDateRange(
  preset: AuditDatePreset,
  referenceDate: Date = new Date(),
): { start: Date; end: Date } | null {
  if (preset === 'all') return null

  const end = new Date(referenceDate)
  end.setHours(23, 59, 59, 999)

  const start = new Date(referenceDate)
  start.setHours(0, 0, 0, 0)

  switch (preset) {
    case 'today':
      return { start, end }
    case 'last_7_days':
      start.setDate(start.getDate() - 6)
      return { start, end }
    case 'last_30_days':
      start.setDate(start.getDate() - 29)
      return { start, end }
    case 'last_3_months':
      start.setMonth(start.getMonth() - 3)
      return { start, end }
    default:
      return null
  }
}

export function isAuditEventInDateRange(
  event: AuditEvent,
  range: { start: Date; end: Date } | null,
): boolean {
  if (!range) return true

  const timestamp = new Date(event.timestamp)
  return timestamp >= range.start && timestamp <= range.end
}

export function matchesAuditActorFilter(
  event: AuditEvent,
  actorFilter: AuditActorFilter,
): boolean {
  if (actorFilter === 'all') return true

  if (actorFilter === 'SYSTEM') {
    return event.actor === 'SYSTEM' || event.actor.toLowerCase() === 'système'
  }

  if (event.actorEmail === actorFilter) return true

  return event.actor === actorFilter
}

export function filterAuditEventsByFilters(
  events: AuditEvent[],
  filters: AuditEventFilters,
  referenceDate: Date = new Date(),
): AuditEvent[] {
  const dateRange = getAuditDateRange(filters.datePreset, referenceDate)

  return events.filter((event) => {
    if (!isAuditEventInDateRange(event, dateRange)) return false
    if (!matchesAuditActorFilter(event, filters.actor)) return false
    if (filters.actionType !== 'all' && event.actionCode !== filters.actionType) return false
    if (filters.severity !== 'all' && event.severity !== filters.severity) return false
    if (filters.resourceType !== 'all' && event.resourceType !== filters.resourceType) return false
    return true
  })
}

export function hasActiveAuditFilters(filters: AuditEventFilters): boolean {
  return (
    filters.datePreset !== 'all' ||
    filters.actor !== 'all' ||
    filters.actionType !== 'all' ||
    filters.severity !== 'all' ||
    filters.resourceType !== 'all'
  )
}

const SYSTEM_ACTOR: AuditActorOption = {
  value: 'SYSTEM',
  label: 'SYSTEM',
}

export function buildAuditActorOptions(events: AuditEvent[]): AuditActorOption[] {
  const byEmail = new Map<string, AuditActorOption>()

  for (const event of events) {
    if (event.actor === 'SYSTEM' || event.actor.toLowerCase() === 'système') {
      continue
    }

    const email = event.actorEmail?.trim()
    if (email) {
      if (!byEmail.has(email)) {
        byEmail.set(email, {
          value: email,
          label: event.actor,
          email,
        })
      }
      continue
    }

    if (!byEmail.has(event.actor)) {
      byEmail.set(event.actor, {
        value: event.actor,
        label: event.actor,
      })
    }
  }

  return [
    SYSTEM_ACTOR,
    ...Array.from(byEmail.values()).sort((left, right) =>
      left.label.localeCompare(right.label, undefined, { sensitivity: 'base' }),
    ),
  ]
}

export function filterAuditActorOptions(
  options: AuditActorOption[],
  search: string,
): AuditActorOption[] {
  const normalized = search.trim().toLowerCase()
  if (!normalized) return options

  return options.filter((option) => {
    const email = option.email?.toLowerCase() ?? ''
    return (
      option.label.toLowerCase().includes(normalized) ||
      email.includes(normalized) ||
      option.value.toLowerCase().includes(normalized)
    )
  })
}

export function resolveAuditSeverity(
  status: AuditEventStatus,
  actionCode: AuditActionCode,
  explicit?: AuditSeverity,
): AuditSeverity {
  if (explicit) return explicit
  if (status === 'denied') return 'failure'
  if (actionCode === 'OAUTH_REAUTHENTICATED') return 'warning'
  if (actionCode === 'LOGIN_FAILED') return 'failure'
  return 'success'
}
