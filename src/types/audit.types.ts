export type AuditEventStatus = 'success' | 'denied'

export interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  ipAddress: string
  status: AuditEventStatus
}

export const auditEventStatusLabels: Record<AuditEventStatus, string> = {
  success: 'Succès',
  denied: 'Refusé (Droits insuffisants)',
}
