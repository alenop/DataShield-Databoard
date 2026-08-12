export type NavIconName =
  | 'layout-dashboard'
  | 'bell'
  | 'database'
  | 'shield'
  | 'settings'
  | 'hard-drive'
  | 'file-output'
  | 'file-input'
  | 'file-text'
  | 'users'
  | 'scroll-text'
  | 'globe'

export type NavBadgeVariant = 'default' | 'danger' | 'warning' | 'info'

export interface NavBadge {
  count: number
  variant?: NavBadgeVariant
}

export interface NavLinkItem {
  id: string
  label: string
  icon?: NavIconName
  href: string
  badge?: NavBadge
  badges?: NavBadge[]
}

export interface NavGroupItem {
  id: string
  label: string
  icon: NavIconName
  badge?: NavBadge
  children: NavLinkItem[]
}

export type NavItem = NavLinkItem | NavGroupItem

export function isNavGroup(item: NavItem): item is NavGroupItem {
  return 'children' in item
}
