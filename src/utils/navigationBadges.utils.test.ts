import { buildNavigationItems } from './navigationBadges.utils'

describe('buildNavigationItems', () => {
  it('shows active alert count excluding info and resolved alerts', () => {
    const items = buildNavigationItems({
      criticalAlerts: 2,
      warningAlerts: 2,
      failedBackups: 0,
      exportsPreparing: 0,
      importsInProgress: 0,
    })

    const alerts = items.find((item) => item.id === 'alerts')
    expect(alerts && 'badge' in alerts && alerts.badge).toEqual({
      count: 4,
      variant: 'danger',
    })
  })

  it('omits badges when there is nothing actionable', () => {
    const items = buildNavigationItems({
      criticalAlerts: 0,
      warningAlerts: 0,
      failedBackups: 0,
      exportsPreparing: 0,
      importsInProgress: 0,
    })

    const alerts = items.find((item) => item.id === 'alerts')
    expect(alerts && 'badge' in alerts && alerts.badge).toBeUndefined()

    const data = items.find((item) => item.id === 'data')
    expect(data && 'badge' in data && data.badge).toBeUndefined()
  })

  it('aggregates data section badges from backups, imports and exports', () => {
    const items = buildNavigationItems({
      criticalAlerts: 0,
      warningAlerts: 0,
      failedBackups: 2,
      exportsPreparing: 1,
      importsInProgress: 1,
    })

    const data = items.find((item) => item.id === 'data')
    expect(data && 'badge' in data && data.badge).toEqual({
      count: 4,
      variant: 'danger',
    })
  })

  it('does not add an audit badge', () => {
    const items = buildNavigationItems({
      criticalAlerts: 1,
      warningAlerts: 0,
      failedBackups: 0,
      exportsPreparing: 0,
      importsInProgress: 0,
    })

    const security = items.find((item) => item.id === 'security')
    expect(security && 'children' in security).toBe(true)
    if (security && 'children' in security) {
      const audit = security.children.find((child) => child.id === 'audit')
      expect(audit?.badge).toBeUndefined()
    }
  })
})
