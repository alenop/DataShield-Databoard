import { filterAuditEventsByQuery } from './auditFilters.utils'
import type { AuditEvent } from '../types/audit.types'

const events: AuditEvent[] = [
  {
    id: '1',
    timestamp: '2026-08-07T14:32:00',
    actor: 'Sophie Martin',
    action: 'Lancement de sauvegarde',
    ipAddress: '192.168.1.45',
    status: 'success',
  },
  {
    id: '2',
    timestamp: '2026-08-07T11:50:00',
    actor: 'Camille Renard',
    action: "Modification d'une politique",
    ipAddress: '172.16.0.8',
    status: 'denied',
  },
  {
    id: '3',
    timestamp: '2026-08-07T10:22:00',
    actor: 'Système',
    action: 'Sauvegarde planifiée',
    ipAddress: '10.0.0.1',
    status: 'success',
  },
]

describe('auditFilters.utils', () => {
  it('returns all events when query is empty', () => {
    expect(filterAuditEventsByQuery(events, '')).toHaveLength(3)
  })

  it('filters by actor name', () => {
    const filtered = filterAuditEventsByQuery(events, 'camille')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].actor).toBe('Camille Renard')
  })

  it('filters by action type', () => {
    const filtered = filterAuditEventsByQuery(events, 'sauvegarde')
    expect(filtered).toHaveLength(2)
  })

  it('filters by status label', () => {
    const filtered = filterAuditEventsByQuery(events, 'droits insuffisants')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].status).toBe('denied')
  })

  it('filters by partial status label', () => {
    const filtered = filterAuditEventsByQuery(events, 'succès')
    expect(filtered).toHaveLength(2)
    expect(filtered.every((event) => event.status === 'success')).toBe(true)
  })

  it('is case insensitive', () => {
    const filtered = filterAuditEventsByQuery(events, 'SYSTÈME')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].actor).toBe('Système')
  })
})
