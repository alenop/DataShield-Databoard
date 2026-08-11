import type { TFunction } from 'i18next'
import {
  AUDIT_ACTION_CATEGORY,
  type AuditActionCode,
  type AuditEvent,
  type AuditEventCategory,
  type AuditEventStatus,
} from '../types/audit.types'

export const DEMO_CLIENT_IP = '192.168.10.12'

export interface AuditLogInput {
  actionCode: AuditActionCode
  status: AuditEventStatus
  metadata?: Record<string, string>
  ipAddress?: string
  timestamp?: string
}

export interface AuditLoggerContext {
  actor: string
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

export function buildAuditEvent(
  input: AuditLogInput,
  context: AuditLoggerContext,
): Omit<AuditEvent, 'id'> {
  return {
    timestamp: input.timestamp ?? new Date().toISOString(),
    actor: context.actor,
    actionCode: input.actionCode,
    category: AUDIT_ACTION_CATEGORY[input.actionCode],
    ipAddress: input.ipAddress ?? context.ipAddress ?? DEMO_CLIENT_IP,
    status: input.status,
    metadata: input.metadata,
  }
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

const LEGACY_ACTION_CODE_MAP: Record<string, AuditActionCode> = {
  'lancement de sauvegarde': 'BACKUP_MANUAL_TRIGGERED',
  'suppression de source': 'SOURCE_DELETED',
  "modification d'une politique": 'POLICY_UPDATED',
  'invitation utilisateur': 'USER_INVITED',
  'rotation des clés api': 'SOURCE_UPDATED',
  'sauvegarde planifiée': 'BACKUP_MANUAL_TRIGGERED',
  'test de connexion source': 'SOURCE_UPDATED',
  "consultation du journal d'audit": 'BACKUP_RECORD_VIEWED',
}

export function normalizeAuditEvent(raw: unknown): AuditEvent | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<AuditEvent> & { action?: string }

  const actionCode =
    record.actionCode ??
    (record.action ? LEGACY_ACTION_CODE_MAP[record.action.trim().toLowerCase()] : undefined)

  if (!actionCode || !record.timestamp || !record.actor || !record.ipAddress || !record.status) {
    return null
  }

  const category = record.category ?? AUDIT_ACTION_CATEGORY[actionCode]

  return {
    id: record.id?.trim() || crypto.randomUUID(),
    timestamp: record.timestamp,
    actor: record.actor,
    actionCode,
    category,
    ipAddress: record.ipAddress,
    status: record.status,
    metadata: record.metadata,
  }
}

export function normalizeAuditEvents(raw: unknown): AuditEvent[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map(normalizeAuditEvent)
    .filter((event): event is AuditEvent => event !== null)
}
