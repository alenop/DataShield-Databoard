import type { Alert, AlertSeverity, AlertSeverityFilter, AlertSummary } from '../types/alert.types'

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

export function filterAlertsBySeverity(
  alerts: Alert[],
  severityFilter: AlertSeverityFilter,
): Alert[] {
  if (severityFilter === 'all') return alerts

  return alerts.filter(
    (alert) => alert.severity === severityFilter && alert.status === 'active',
  )
}

export function sortAlerts(alerts: Alert[]): Alert[] {
  return [...alerts].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === 'active' ? -1 : 1
    }

    if (left.status === 'active' && right.status === 'active') {
      const severityDiff = SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]
      if (severityDiff !== 0) return severityDiff
    }

    return new Date(right.triggeredAt).getTime() - new Date(left.triggeredAt).getTime()
  })
}

export function countAlertSummary(alerts: Alert[]): AlertSummary {
  return alerts.reduce<AlertSummary>(
    (summary, alert) => {
      if (alert.status === 'resolved') {
        summary.resolved += 1
        return summary
      }

      if (alert.severity === 'critical') summary.critical += 1
      if (alert.severity === 'warning') summary.warning += 1
      if (alert.severity === 'info') summary.info += 1
      return summary
    },
    { critical: 0, warning: 0, info: 0, resolved: 0 },
  )
}

export function markAlertAsResolved(alerts: Alert[], alertId: string): Alert[] {
  const now = new Date().toISOString()

  return alerts.map((alert) =>
    alert.id === alertId && alert.status === 'active'
      ? { ...alert, status: 'resolved' as const, resolvedAt: now }
      : alert,
  )
}

export function formatAlertDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function parseStoredAlerts(stored: string | null, fallback: Alert[]): Alert[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map(normalizeAlert)
      .filter((alert): alert is Alert => alert !== null)

    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

function isAlertSeverity(value: string): value is AlertSeverity {
  return value === 'critical' || value === 'warning' || value === 'info'
}

function isAlertStatus(value: string): value is Alert['status'] {
  return value === 'active' || value === 'resolved'
}

function normalizeAlert(raw: unknown): Alert | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<Alert>
  const message = record.message?.trim()
  const triggeredAt = record.triggeredAt?.trim()
  const severity = record.severity

  if (!message || !triggeredAt || !severity || !isAlertSeverity(severity)) return null

  const status = record.status && isAlertStatus(record.status) ? record.status : 'active'

  return {
    id: record.id?.trim() || crypto.randomUUID(),
    severity,
    message,
    triggeredAt,
    status,
    resolvedAt: record.resolvedAt?.trim(),
  }
}
