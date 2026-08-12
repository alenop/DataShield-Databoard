import { formatAuditDateTime, sortAuditEventsByDateDesc } from './auditFormatters'
import type { AuditEvent } from '../types/audit.types'

describe('auditFormatters', () => {
  it('formats timestamp as YYYY-MM-DD HH:mm', () => {
    expect(formatAuditDateTime('2026-08-07T14:32:00')).toBe('2026-08-07 14:32')
  })

  it('sorts events by date descending', () => {
    const events: AuditEvent[] = [
      {
        id: '1',
        timestamp: '2026-08-07T09:00:00',
        actor: 'A',
        actionCode: 'SOURCE_CREATED',
        category: 'config',
        resourceType: 'DATA_SOURCE',
        severity: 'success',
        ipAddress: '1.1.1.1',
        status: 'success',
      },
      {
        id: '2',
        timestamp: '2026-08-07T14:32:00',
        actor: 'B',
        actionCode: 'SOURCE_UPDATED',
        category: 'config',
        resourceType: 'DATA_SOURCE',
        severity: 'success',
        ipAddress: '2.2.2.2',
        status: 'success',
      },
    ]

    const sorted = sortAuditEventsByDateDesc(events)
    expect(sorted[0].id).toBe('2')
  })
})
