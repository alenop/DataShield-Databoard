import type { TFunction } from 'i18next'
import {
  AUDIT_ACTION_CATEGORY,
  AUDIT_ACTION_RESOURCE_TYPE,
  type AuditActionCode,
  type AuditEvent,
  type AuditEventCategory,
  type AuditEventStatus,
  type AuditSeverity,
} from '../types/audit.types'
import { resolveAuditSeverity } from './auditFilters.utils'

export const DEMO_CLIENT_IP = '192.168.10.12'

export const SYSTEM_AUDIT_ACTOR = 'SYSTEM'

export interface AuditLogInput {
  actionCode: AuditActionCode
  status: AuditEventStatus
  severity?: AuditSeverity
  metadata?: Record<string, string>
  ipAddress?: string
  timestamp?: string
}

export interface AuditLoggerContext {
  actor: string
  actorEmail?: string
  ipAddress?: string
}

export type AuditLogger = (input: AuditLogInput) => void

export function createAuditLogger(
  appendEvent: (event: Omit<AuditEvent, 'id'>) => void,
  context: AuditLoggerContext,
): AuditLogger {
  return (input) => {
    appendEvent(buildAuditEvent(input, context))
  }
}

export function normalizeAuditActor(actor: string): string {
  const trimmed = actor.trim()
  if (trimmed.toLowerCase() === 'système' || trimmed.toLowerCase() === 'system') {
    return SYSTEM_AUDIT_ACTOR
  }
  return trimmed
}

export function buildAuditEvent(
  input: AuditLogInput,
  context: AuditLoggerContext,
): Omit<AuditEvent, 'id'> {
  const actionCode = input.actionCode
  const status = input.status
  const actor = normalizeAuditActor(context.actor)

  return {
    timestamp: input.timestamp ?? new Date().toISOString(),
    actor,
    actorEmail: actor === SYSTEM_AUDIT_ACTOR ? undefined : context.actorEmail,
    actionCode,
    category: AUDIT_ACTION_CATEGORY[actionCode],
    resourceType: AUDIT_ACTION_RESOURCE_TYPE[actionCode],
    severity: resolveAuditSeverity(status, actionCode, input.severity),
    ipAddress: input.ipAddress ?? context.ipAddress ?? DEMO_CLIENT_IP,
    status,
    metadata: input.metadata,
  }
}

export function getAuditActionFilterLabel(actionCode: AuditActionCode, t: TFunction): string {
  return t(`audit.actionFilters.${actionCode}`, { defaultValue: actionCode })
}

export function getAuditActionLabel(event: AuditEvent, t: TFunction): string {
  return t(`audit.actions.${event.actionCode}`, {
    ...(event.metadata ?? {}),
    defaultValue: event.actionCode,
  })
}

export function getAuditCategoryLabel(category: AuditEventCategory, t: TFunction): string {
  return t(`audit.categories.${category}`)
}

export function getAuditResourceTypeLabel(resourceType: AuditEvent['resourceType'], t: TFunction): string {
  return t(`audit.resourceTypes.${resourceType}`)
}

const LEGACY_ACTION_CODE_MAP: Record<string, AuditActionCode> = {
  'lancement de sauvegarde': 'BACKUP_MANUAL_TRIGGERED',
  'suppression de source': 'SOURCE_DELETED',
  "modification d'une politique": 'POLICY_UPDATED',
  'invitation utilisateur': 'USER_INVITED',
  'rotation des clés api': 'API_KEY_ROTATED',
  'sauvegarde planifiée': 'BACKUP_MANUAL_TRIGGERED',
  'test de connexion source': 'SOURCE_UPDATED',
  "consultation du journal d'audit": 'BACKUP_RECORD_VIEWED',
}

function isAuditActionCode(value: string): value is AuditActionCode {
  return value in AUDIT_ACTION_CATEGORY
}

export function normalizeAuditEvent(raw: unknown): AuditEvent | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<AuditEvent> & { action?: string; scope?: string }

  const actionCode =
    record.actionCode ??
    (record.action ? LEGACY_ACTION_CODE_MAP[record.action.trim().toLowerCase()] : undefined)

  if (!actionCode || !isAuditActionCode(actionCode)) return null
  if (!record.timestamp || !record.actor || !record.ipAddress || !record.status) return null

  const status = record.status
  const actor = normalizeAuditActor(record.actor)
  const category = record.category ?? AUDIT_ACTION_CATEGORY[actionCode]
  const resourceType = record.resourceType ?? AUDIT_ACTION_RESOURCE_TYPE[actionCode]
  const severity = resolveAuditSeverity(status, actionCode, record.severity)

  return {
    id: record.id?.trim() || crypto.randomUUID(),
    timestamp: record.timestamp,
    actor,
    actorEmail: record.actorEmail,
    actionCode,
    category,
    resourceType,
    severity,
    ipAddress: record.ipAddress,
    status,
    metadata: record.metadata,
  }
}

export function normalizeAuditEvents(raw: unknown): AuditEvent[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map(normalizeAuditEvent)
    .filter((event): event is AuditEvent => event !== null)
}
