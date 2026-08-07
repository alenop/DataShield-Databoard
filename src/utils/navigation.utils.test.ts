import type { NavItem } from '../types/navigation.types'
import { findNavItemById, findParentGroupId } from './navigation.utils'

const mockItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: 'layout-dashboard',
    href: '/dashboard',
  },
  {
    id: 'data',
    label: 'Données',
    icon: 'database',
    children: [
      {
        id: 'backups',
        label: 'Sauvegardes',
        icon: 'hard-drive',
        href: '/data/backups',
      },
      {
        id: 'exports',
        label: 'Exports',
        icon: 'file-output',
        href: '/data/exports',
      },
    ],
  },
]

describe('findNavItemById', () => {
  it('finds a top-level item', () => {
    const item = findNavItemById(mockItems, 'dashboard')
    expect(item?.id).toBe('dashboard')
  })

  it('finds a nested child item', () => {
    const item = findNavItemById(mockItems, 'backups')
    expect(item?.label).toBe('Sauvegardes')
  })

  it('returns undefined for unknown id', () => {
    expect(findNavItemById(mockItems, 'unknown')).toBeUndefined()
  })
})

describe('findParentGroupId', () => {
  it('returns parent group id for a child item', () => {
    expect(findParentGroupId(mockItems, 'backups')).toBe('data')
  })

  it('returns null for a top-level item', () => {
    expect(findParentGroupId(mockItems, 'dashboard')).toBeNull()
  })

  it('returns null for unknown id', () => {
    expect(findParentGroupId(mockItems, 'unknown')).toBeNull()
  })
})
