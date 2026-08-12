import { defaultNavigationItems } from '../data/defaultNavigation'
import type { NavBadge, NavItem } from '../types/navigation.types'
import { isNavGroup } from '../types/navigation.types'

export interface NavigationBadgeInput {
  criticalAlerts: number
  warningAlerts: number
  infoAlerts: number
  failedBackups: number
  exportsPreparing: number
  importsInProgress: number
}

function createBadge(count: number, variant: NavBadge['variant']): NavBadge | undefined {
  if (count <= 0) return undefined
  return { count, variant }
}

function buildAlertBadges(input: NavigationBadgeInput): NavBadge[] {
  return [
    createBadge(input.criticalAlerts, 'danger'),
    createBadge(input.warningAlerts, 'warning'),
    createBadge(input.infoAlerts, 'info'),
  ].filter((badge): badge is NavBadge => badge !== undefined)
}

export function buildNavigationItems(input: NavigationBadgeInput): NavItem[] {
  const alertBadges = buildAlertBadges(input)

  const backupsBadge = createBadge(input.failedBackups, 'danger')
  const importsBadge = createBadge(input.importsInProgress, 'warning')
  const exportsBadge = createBadge(input.exportsPreparing, 'warning')

  const dataGroupCount =
    input.failedBackups + input.importsInProgress + input.exportsPreparing
  const dataGroupBadge = createBadge(
    dataGroupCount,
    input.failedBackups > 0 ? 'danger' : 'warning',
  )

  return defaultNavigationItems.map((item) => {
    if (item.id === 'alerts') {
      return {
        ...item,
        badges: alertBadges.length > 0 ? alertBadges : undefined,
      }
    }

    if (isNavGroup(item) && item.id === 'data') {
      return {
        ...item,
        badge: dataGroupBadge,
        children: item.children.map((child) => {
          if (child.id === 'backups') return { ...child, badge: backupsBadge }
          if (child.id === 'imports') return { ...child, badge: importsBadge }
          if (child.id === 'exports') return { ...child, badge: exportsBadge }
          return child
        }),
      }
    }

    return item
  })
}
