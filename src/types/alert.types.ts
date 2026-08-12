export type AlertSeverity = 'critical' | 'warning' | 'info'

export type AlertSeverityFilter = 'all' | AlertSeverity

export type AlertStatus = 'active' | 'resolved'

export interface Alert {
  id: string
  severity: AlertSeverity
  message: string
  triggeredAt: string
  status: AlertStatus
  resolvedAt?: string
}

export interface AlertSummary {
  critical: number
  warning: number
  info: number
  resolved: number
}

export const alertSeverityLabels: Record<AlertSeverity, string> = {
  critical: 'Critique',
  warning: 'Warning',
  info: 'Info',
}

export const alertStatusLabels: Record<AlertStatus, string> = {
  active: 'Active',
  resolved: 'Résolue',
}
