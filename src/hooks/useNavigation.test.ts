import { act, renderHook } from '@testing-library/react'
import type { NavItem } from '../types/navigation.types'
import { useNavigation } from './useNavigation'

const items: NavItem[] = [
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
    ],
  },
]

describe('useNavigation', () => {
  it('initializes with default active item', () => {
    const { result } = renderHook(() => useNavigation({ items }))
    expect(result.current.activeId).toBe('dashboard')
    expect(result.current.activeItem?.label).toBe('Tableau de bord')
  })

  it('expands parent group when default active is a child', () => {
    const { result } = renderHook(() =>
      useNavigation({ items, defaultActiveId: 'backups' }),
    )
    expect(result.current.expandedGroups.has('data')).toBe(true)
  })

  it('selects item and expands parent group', () => {
    const { result } = renderHook(() => useNavigation({ items }))

    act(() => {
      result.current.selectItem('backups')
    })

    expect(result.current.activeId).toBe('backups')
    expect(result.current.expandedGroups.has('data')).toBe(true)
    expect(result.current.isMobileOpen).toBe(false)
  })

  it('toggles collapsed state', () => {
    const { result } = renderHook(() => useNavigation({ items }))

    act(() => {
      result.current.toggleCollapsed()
    })

    expect(result.current.isCollapsed).toBe(true)
  })

  it('toggles group expansion', () => {
    const { result } = renderHook(() => useNavigation({ items }))

    act(() => {
      result.current.toggleGroup('data')
    })

    expect(result.current.expandedGroups.has('data')).toBe(true)

    act(() => {
      result.current.toggleGroup('data')
    })

    expect(result.current.expandedGroups.has('data')).toBe(false)
  })
})
