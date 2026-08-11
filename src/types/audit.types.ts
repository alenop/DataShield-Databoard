export type AuditEventStatus = 'success' | 'denied'

export type AuditEventCategory = 'auth' | 'config' | 'data_ops' | 'sensitive_read'

export type AuditActionCode =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'SOURCE_CREATED'
  | 'SOURCE_UPDATED'
  | 'SOURCE_DELETED'
  | 'POLICY_CREATED'
  | 'POLICY_UPDATED'
  | 'USER_ROLE_CHANGED'
  | 'USER_INVITED'
  | 'BACKUP_MANUAL_TRIGGERED'
  | 'RESTORE_JOB_TRIGGERED'
  | 'DATA_EXPORT_REQUESTED'
  | 'DATA_EXPORT_DOWNLOADED'
  | 'BACKUP_RECORD_VIEWED'

export interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  actionCode: AuditActionCode
  category: AuditEventCategory
  ipAddress: string
  status: AuditEventStatus
  metadata?: Record<string, string>
}

export const AUDIT_ACTION_CATEGORY: Record<AuditActionCode, AuditEventCategory> = {
  LOGIN_SUCCESS: 'auth',
  LOGIN_FAILED: 'auth',
  LOGOUT: 'auth',
  PASSWORD_RESET: 'auth',
  SOURCE_CREATED: 'config',
  SOURCE_UPDATED: 'config',
  SOURCE_DELETED: 'config',
  POLICY_CREATED: 'config',
  POLICY_UPDATED: 'config',
  USER_ROLE_CHANGED: 'config',
  USER_INVITED: 'config',
  BACKUP_MANUAL_TRIGGERED: 'data_ops',
  RESTORE_JOB_TRIGGERED: 'data_ops',
  DATA_EXPORT_REQUESTED: 'sensitive_read',
  DATA_EXPORT_DOWNLOADED: 'sensitive_read',
  BACKUP_RECORD_VIEWED: 'sensitive_read',
}

export const auditEventStatusLabels: Record<AuditEventStatus, string> = {
  success: 'Succès',
  denied: 'Refusé (Droits insuffisants)',
}
