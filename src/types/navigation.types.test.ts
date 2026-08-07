import type { NavItem } from '../types/navigation.types'
import { isNavGroup } from './navigation.types'

describe('isNavGroup', () => {
  const linkItem: NavItem = {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: 'layout-dashboard',
    href: '/dashboard',
  }

  const groupItem: NavItem = {
    id: 'data',
    label: 'Données',
    icon: 'database',
    children: [
      {
        id: 'backups',
        label: 'Sauvegardes',
        href: '/data/backups',
      },
    ],
  }

  it('returns false for a link item', () => {
    expect(isNavGroup(linkItem)).toBe(false)
  })

  it('returns true for a group item', () => {
    expect(isNavGroup(groupItem)).toBe(true)
  })
})
