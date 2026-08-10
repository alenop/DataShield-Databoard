import { Menu, PanelLeftClose, PanelLeftOpen, Shield, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NavigationState } from '../../hooks/useNavigation'
import { isNavGroup } from '../../types/navigation.types'
import { NavGroup } from './NavGroup'
import { NavLinkButton } from './NavLinkButton'

interface NavigationBarProps {
  navigation: NavigationState
}

export function NavigationBar({ navigation }: NavigationBarProps) {
  const { t } = useTranslation()
  const {
    items,
    activeId,
    isCollapsed,
    isMobileOpen,
    expandedGroups,
    toggleCollapsed,
    toggleMobileOpen,
    closeMobile,
    toggleGroup,
    selectItem,
  } = navigation

  const sidebarClasses = [
    'fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-white transition-all duration-300',
    'border-r border-slate-800',
    isCollapsed ? 'w-16' : 'w-64',
    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
    'md:translate-x-0',
  ].join(' ')

  return (
    <>
      <button
        type="button"
        onClick={toggleMobileOpen}
        aria-label={t('nav.openMenu')}
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-900 p-2 text-white shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isMobileOpen && (
        <button
          type="button"
          aria-label={t('nav.closeMenu')}
          onClick={closeMobile}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside className={sidebarClasses} aria-label={t('nav.mainNavigation')}>
        <div
          className={[
            'flex h-16 shrink-0 items-center border-b border-slate-800',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4',
          ].join(' ')}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-400" aria-hidden="true" />
              <span className="text-base font-bold tracking-tight">{t('common.appName')}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
              className="hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:inline-flex"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={closeMobile}
              aria-label={t('nav.closeMenu')}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                {isNavGroup(item) ? (
                  <NavGroup
                    group={item}
                    isExpanded={expandedGroups.has(item.id)}
                    isCollapsed={isCollapsed}
                    activeId={activeId}
                    onToggleGroup={toggleGroup}
                    onSelectItem={selectItem}
                  />
                ) : (
                  <NavLinkButton
                    item={item}
                    isActive={activeId === item.id}
                    isCollapsed={isCollapsed}
                    onSelect={selectItem}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        {!isCollapsed && (
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
                AD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Admin Demo</p>
                <p className="truncate text-xs text-slate-400">admin@datashield.test</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
