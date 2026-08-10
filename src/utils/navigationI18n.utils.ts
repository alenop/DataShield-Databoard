import type { TFunction } from 'i18next'
import type { NavItem } from '../types/navigation.types'
import { isNavGroup } from '../types/navigation.types'

export function localizeNavigationItems(items: NavItem[], t: TFunction): NavItem[] {
  return items.map((item) => {
    if (isNavGroup(item)) {
      return {
        ...item,
        label: t(`nav.${item.id}`),
        children: item.children.map((child) => ({
          ...child,
          label: t(`nav.${child.id}`),
        })),
      }
    }

    return {
      ...item,
      label: t(`nav.${item.id}`),
    }
  })
}
