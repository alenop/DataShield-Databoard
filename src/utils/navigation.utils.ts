import type { NavItem } from '../types/navigation.types'
import { isNavGroup } from '../types/navigation.types'

export function findNavItemById(items: NavItem[], id: string): NavItem | undefined {
  for (const item of items) {
    if (item.id === id) return item
    if (isNavGroup(item)) {
      const child = item.children.find((c) => c.id === id)
      if (child) return child
    }
  }
  return undefined
}

export function findParentGroupId(items: NavItem[], childId: string): string | null {
  for (const item of items) {
    if (isNavGroup(item) && item.children.some((c) => c.id === childId)) {
      return item.id
    }
  }
  return null
}
