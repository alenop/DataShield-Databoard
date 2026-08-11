import i18n from '../i18n'
import { filterAuditEventsByQuery } from './auditFilters.utils'
import { getAuditActionLabel } from './auditLogger.utils'
import type { AuditEvent } from '../types/audit.types'

const events: AuditEvent[] = [
  {
    id: '1',
    timestamp: '2026-08-07T14:32:00',
    actor: 'Admin Demo',
    actionCode: 'BACKUP_MANUAL_TRIGGERED',
    category: 'data_ops',
    ipAddress: '192.168.1.45',
    status: 'success',
    metadata: { name: 'Sauvegarde Pistes & Contacts' },
  },
  {
    id: '2',
    timestamp: '2026-08-07T11:50:00',
    actor: 'Camille Renard',
    actionCode: 'POLICY_UPDATED',
    category: 'config',
    ipAddress: '172.16.0.8',
    status: 'denied',
    metadata: { name: 'Sauvegarde Quotidienne Production' },
  },
  {
    id: '3',
    timestamp: '2026-08-07T10:22:00',
    actor: 'Système',
    actionCode: 'BACKUP_MANUAL_TRIGGERED',
    category: 'data_ops',
    ipAddress: '10.0.0.1',
    status: 'success',
    metadata: { name: 'Sauvegarde planifiée Contacts' },
  },
]

describe('auditFilters.utils', () => {
  const translateAction = (event: AuditEvent) => getAuditActionLabel(event, i18n.t)

  it('returns all events when query is empty', () => {
    expect(filterAuditEventsByQuery(events, '')).toHaveLength(3)
  })

  it('filters by actor name', () => {
    const filtered = filterAuditEventsByQuery(events, 'camille', translateAction)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].actor).toBe('Camille Renard')
  })

  it('filters by action type', () => {
    const filtered = filterAuditEventsByQuery(events, 'manuelle', translateAction)
    expect(filtered).toHaveLength(2)
  })

  it('filters by status label', () => {
    const filtered = filterAuditEventsByQuery(events, 'droits insuffisants', translateAction)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].status).toBe('denied')
  })
})
