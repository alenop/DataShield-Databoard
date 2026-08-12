export type AuditEventStatus = 'success' | 'denied'

export type AuditSeverity = 'success' | 'failure' | 'warning'

export type AuditEventCategory = 'auth' | 'config' | 'data_ops' | 'sensitive_read'

export type AuditResourceType =
  | 'DATA_SOURCE'
  | 'BACKUP_POLICY'
  | 'RESTORE_JOB'
  | 'DATA_EXPORT'
  | 'USER_ACCOUNT'

export type AuditActionCode =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'SOURCE_CREATED'
  | 'SOURCE_UPDATED'
  | 'SOURCE_DELETED'
  | 'API_KEY_ROTATED'
  | 'OAUTH_REAUTHENTICATED'
  | 'POLICY_CREATED'
  | 'POLICY_UPDATED'
  | 'USER_ROLE_CHANGED'
  | 'USER_INVITED'
  | 'BACKUP_MANUAL_TRIGGERED'
  | 'RESTORE_JOB_TRIGGERED'
  | 'RESTORE_JOB_COMPLETED'
  | 'DATA_BULK_UPDATED'
  | 'DATA_EXPORT_REQUESTED'
  | 'DATA_EXPORT_DOWNLOADED'
  | 'BACKUP_RECORD_VIEWED'

export type AuditDatePreset = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'last_3_months'

export type AuditActorFilter = 'all' | 'SYSTEM' | string

export type AuditActionFilter = 'all' | AuditActionCode

export type AuditSeverityFilter = 'all' | AuditSeverity

export type AuditResourceFilter = 'all' | AuditResourceType

export interface AuditEventFilters {
  datePreset: AuditDatePreset
  actor: AuditActorFilter
  actionType: AuditActionFilter
  severity: AuditSeverityFilter
  resourceType: AuditResourceFilter
}

export interface AuditActorOption {
  value: AuditActorFilter
  label: string
  email?: string
}

export interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  actorEmail?: string
  actionCode: AuditActionCode
  category: AuditEventCategory
  resourceType: AuditResourceType
  severity: AuditSeverity
  ipAddress: string
  status: AuditEventStatus
  metadata?: Record<string, string>
}

export const DEFAULT_AUDIT_FILTERS: AuditEventFilters = {
  datePreset: 'all',
  actor: 'all',
  actionType: 'all',
  severity: 'all',
  resourceType: 'all',
}

export const AUDIT_DATE_PRESETS: AuditDatePreset[] = [
  'all',
  'today',
  'last_7_days',
  'last_30_days',
  'last_3_months',
]

export const AUDIT_SEVERITY_FILTERS: AuditSeverityFilter[] = [
  'all',
  'success',
  'failure',
  'warning',
]

export const AUDIT_RESOURCE_TYPES: AuditResourceType[] = [
  'DATA_SOURCE',
  'BACKUP_POLICY',
  'RESTORE_JOB',
  'DATA_EXPORT',
  'USER_ACCOUNT',
]

export const AUDIT_ACTION_GROUPS: {
  labelKey: string
  actions: AuditActionCode[]
}[] = [
  {
    labelKey: 'audit.actionGroups.auth',
    actions: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_RESET'],
  },
  {
    labelKey: 'audit.actionGroups.sources',
    actions: ['SOURCE_CREATED', 'SOURCE_UPDATED', 'SOURCE_DELETED'],
  },
  {
    labelKey: 'audit.actionGroups.security',
    actions: ['API_KEY_ROTATED', 'OAUTH_REAUTHENTICATED'],
  },
  {
    labelKey: 'audit.actionGroups.backups',
    actions: ['BACKUP_MANUAL_TRIGGERED', 'RESTORE_JOB_TRIGGERED', 'RESTORE_JOB_COMPLETED'],
  },
  {
    labelKey: 'audit.actionGroups.exports',
    actions: ['DATA_EXPORT_REQUESTED', 'DATA_EXPORT_DOWNLOADED'],
  },
  {
    labelKey: 'audit.actionGroups.policies',
    actions: ['POLICY_CREATED', 'POLICY_UPDATED', 'USER_ROLE_CHANGED', 'USER_INVITED'],
  },
]

export const AUDIT_ACTION_CATEGORY: Record<AuditActionCode, AuditEventCategory> = {
  LOGIN_SUCCESS: 'auth',
  LOGIN_FAILED: 'auth',
  LOGOUT: 'auth',
  PASSWORD_RESET: 'auth',
  SOURCE_CREATED: 'config',
  SOURCE_UPDATED: 'config',
  SOURCE_DELETED: 'config',
  API_KEY_ROTATED: 'config',
  OAUTH_REAUTHENTICATED: 'config',
  POLICY_CREATED: 'config',
  POLICY_UPDATED: 'config',
  USER_ROLE_CHANGED: 'config',
  USER_INVITED: 'config',
  BACKUP_MANUAL_TRIGGERED: 'data_ops',
  RESTORE_JOB_TRIGGERED: 'data_ops',
  RESTORE_JOB_COMPLETED: 'data_ops',
  DATA_BULK_UPDATED: 'data_ops',
  DATA_EXPORT_REQUESTED: 'sensitive_read',
  DATA_EXPORT_DOWNLOADED: 'sensitive_read',
  BACKUP_RECORD_VIEWED: 'sensitive_read',
}

export const AUDIT_ACTION_RESOURCE_TYPE: Record<AuditActionCode, AuditResourceType> = {
  LOGIN_SUCCESS: 'USER_ACCOUNT',
  LOGIN_FAILED: 'USER_ACCOUNT',
  LOGOUT: 'USER_ACCOUNT',
  PASSWORD_RESET: 'USER_ACCOUNT',
  SOURCE_CREATED: 'DATA_SOURCE',
  SOURCE_UPDATED: 'DATA_SOURCE',
  SOURCE_DELETED: 'DATA_SOURCE',
  API_KEY_ROTATED: 'DATA_SOURCE',
  OAUTH_REAUTHENTICATED: 'DATA_SOURCE',
  POLICY_CREATED: 'BACKUP_POLICY',
  POLICY_UPDATED: 'BACKUP_POLICY',
  USER_ROLE_CHANGED: 'USER_ACCOUNT',
  USER_INVITED: 'USER_ACCOUNT',
  BACKUP_MANUAL_TRIGGERED: 'DATA_SOURCE',
  RESTORE_JOB_TRIGGERED: 'RESTORE_JOB',
  RESTORE_JOB_COMPLETED: 'RESTORE_JOB',
  DATA_BULK_UPDATED: 'DATA_SOURCE',
  DATA_EXPORT_REQUESTED: 'DATA_EXPORT',
  DATA_EXPORT_DOWNLOADED: 'DATA_EXPORT',
  BACKUP_RECORD_VIEWED: 'DATA_SOURCE',
}

export const auditEventStatusLabels: Record<AuditEventStatus, string> = {
  success: 'Succès',
  denied: 'Refusé (Droits insuffisants)',
}
