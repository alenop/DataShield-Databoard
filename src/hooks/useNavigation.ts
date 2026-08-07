import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NavItem } from '../types/navigation.types'
import { findNavItemById, findParentGroupId } from '../utils/navigation.utils'

interface UseNavigationOptions {
  items: NavItem[]
  defaultActiveId?: string
}

export function useNavigation({ items, defaultActiveId = 'dashboard' }: UseNavigationOptions) {
  const [activeId, setActiveId] = useState(defaultActiveId)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const parentId = findParentGroupId(items, defaultActiveId)
    return parentId ? new Set([parentId]) : new Set()
  })

  const activeItem = useMemo(() => findNavItemById(items, activeId), [items, activeId])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const toggleMobileOpen = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])

  const selectItem = useCallback(
    (id: string) => {
      setActiveId(id)
      const parentId = findParentGroupId(items, id)
      if (parentId) {
        setExpandedGroups((prev) => new Set(prev).add(parentId))
      }
      closeMobile()
    },
    [items, closeMobile],
  )

  useEffect(() => {
    if (!isMobileOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobile()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileOpen, closeMobile])

  return {
    items,
    activeId,
    activeItem,
    isCollapsed,
    isMobileOpen,
    expandedGroups,
    toggleCollapsed,
    toggleMobileOpen,
    closeMobile,
    toggleGroup,
    selectItem,
  }
}

export type NavigationState = ReturnType<typeof useNavigation>
