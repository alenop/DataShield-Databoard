import { countAlertSummary, markAlertAsResolved, sortAlerts } from './alert.utils'
import type { Alert } from '../types/alert.types'

const sampleAlerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    message: 'Espace de stockage bientôt saturé (89 %)',
    triggeredAt: '2026-08-07T14:32:00',
    status: 'active',
  },
  {
    id: '2',
    severity: 'warning',
    message: 'Échec OAuth',
    triggeredAt: '2026-08-07T13:15:00',
    status: 'active',
  },
  {
    id: '3',
    severity: 'info',
    message: 'Maintenance planifiée',
    triggeredAt: '2026-08-07T09:00:00',
    status: 'active',
  },
  {
    id: '4',
    severity: 'critical',
    message: 'Certificat expiré',
    triggeredAt: '2026-08-06T08:00:00',
    status: 'resolved',
    resolvedAt: '2026-08-06T14:22:00',
  },
]

describe('alert.utils', () => {
  it('counts alert summary', () => {
    expect(countAlertSummary(sampleAlerts)).toEqual({
      critical: 1,
      warning: 1,
      info: 1,
      resolved: 1,
    })
  })

  it('sorts active alerts before resolved ones', () => {
    const sorted = sortAlerts(sampleAlerts)
    expect(sorted[0].status).toBe('active')
    expect(sorted[sorted.length - 1].status).toBe('resolved')
  })

  it('marks an alert as resolved', () => {
    const updated = markAlertAsResolved(sampleAlerts, '1')
    expect(updated.find((alert) => alert.id === '1')?.status).toBe('resolved')
    expect(updated.find((alert) => alert.id === '1')?.resolvedAt).toBeDefined()
  })
})
