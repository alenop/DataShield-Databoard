import type { AuditEvent } from '../types/audit.types'
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
      event.actionCode.toLowerCase().includes(normalized) ||
      actionLabel.includes(normalized) ||
      statusLabel.includes(normalized) ||
      Object.values(event.metadata ?? {}).some((value) =>
        value.toLowerCase().includes(normalized),
      )
    )
  })
}
