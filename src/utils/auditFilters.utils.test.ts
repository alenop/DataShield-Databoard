import i18n from '../i18n'
import {
  buildAuditActorOptions,
  filterAuditEventsByFilters,
  filterAuditEventsByQuery,
  getAuditDateRange,
  matchesAuditActorFilter,
} from './auditFilters.utils'
import { getAuditActionLabel } from './auditLogger.utils'
import type { AuditEvent } from '../types/audit.types'
import { DEFAULT_AUDIT_FILTERS } from '../types/audit.types'

const events: AuditEvent[] = [
  {
    id: '1',
    timestamp: '2026-08-07T14:32:00',
    actor: 'Admin Demo',
    actorEmail: 'admin@datashield.test',
    actionCode: 'BACKUP_MANUAL_TRIGGERED',
    category: 'data_ops',
    resourceType: 'DATA_SOURCE',
    severity: 'success',
    ipAddress: '192.168.1.45',
    status: 'success',
    metadata: { name: 'Sauvegarde Pistes & Contacts' },
  },
  {
    id: '2',
    timestamp: '2026-08-07T11:50:00',
    actor: 'Camille Renard',
    actorEmail: 'auditor@cabinet-audit.com',
    actionCode: 'POLICY_UPDATED',
    category: 'config',
    resourceType: 'BACKUP_POLICY',
    severity: 'failure',
    ipAddress: '172.16.0.8',
    status: 'denied',
    metadata: { name: 'Sauvegarde Quotidienne Production' },
  },
  {
    id: '3',
    timestamp: '2026-08-07T10:22:00',
    actor: 'SYSTEM',
    actionCode: 'BACKUP_MANUAL_TRIGGERED',
    category: 'data_ops',
    resourceType: 'DATA_SOURCE',
    severity: 'success',
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

  it('filters by severity', () => {
    const filtered = filterAuditEventsByFilters(events, {
      ...DEFAULT_AUDIT_FILTERS,
      severity: 'failure',
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].severity).toBe('failure')
  })

  it('filters by resource type', () => {
    const filtered = filterAuditEventsByFilters(events, {
      ...DEFAULT_AUDIT_FILTERS,
      resourceType: 'BACKUP_POLICY',
    })
    expect(filtered).toHaveLength(1)
  })

  it('filters by SYSTEM actor', () => {
    expect(matchesAuditActorFilter(events[2], 'SYSTEM')).toBe(true)
    const filtered = filterAuditEventsByFilters(events, {
      ...DEFAULT_AUDIT_FILTERS,
      actor: 'SYSTEM',
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].actor).toBe('SYSTEM')
  })

  it('filters by actor email', () => {
    const filtered = filterAuditEventsByFilters(events, {
      ...DEFAULT_AUDIT_FILTERS,
      actor: 'admin@datashield.test',
    })
    expect(filtered).toHaveLength(1)
  })

  it('builds actor options including SYSTEM', () => {
    const options = buildAuditActorOptions(events)
    expect(options.some((option) => option.value === 'SYSTEM')).toBe(true)
    expect(options.some((option) => option.email === 'admin@datashield.test')).toBe(true)
  })

  it('computes date range presets', () => {
    const reference = new Date('2026-08-07T12:00:00')
    const range = getAuditDateRange('today', reference)
    expect(range).not.toBeNull()
    expect(range!.start.getDate()).toBe(7)
  })
})
