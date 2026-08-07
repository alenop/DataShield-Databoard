import type { AuditEvent } from '../types/audit.types'
import { auditEventStatusLabels } from '../types/audit.types'

export function filterAuditEventsByQuery(
  events: AuditEvent[],
  query: string,
): AuditEvent[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return events

  return events.filter((event) => {
    const statusLabel = auditEventStatusLabels[event.status].toLowerCase()

    return (
      event.actor.toLowerCase().includes(normalized) ||
      event.action.toLowerCase().includes(normalized) ||
      statusLabel.includes(normalized)
    )
  })
}
