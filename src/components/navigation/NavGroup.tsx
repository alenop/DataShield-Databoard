import { ChevronDown } from 'lucide-react'
import type { NavGroupItem } from '../../types/navigation.types'
import { NavIcon } from '../../utils/navIcons'
import { NavBadge } from './NavBadge'
import { NavLinkButton } from './NavLinkButton'

interface NavGroupProps {
  group: NavGroupItem
  isExpanded: boolean
  isCollapsed: boolean
  activeId: string
  onToggleGroup: (groupId: string) => void
  onSelectItem: (id: string) => void
}

export function NavGroup({
  group,
  isExpanded,
  isCollapsed,
  activeId,
  onToggleGroup,
  onSelectItem,
}: NavGroupProps) {
  const hasActiveChild = group.children.some((child) => child.id === activeId)

  if (isCollapsed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => onToggleGroup(group.id)}
          aria-expanded={isExpanded}
          aria-haspopup="true"
          title={group.label}
          className={[
            'group relative flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-colors',
            hasActiveChild
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
          ].join(' ')}
        >
          <NavIcon
            name={group.icon}
            className={`h-5 w-5 ${hasActiveChild ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
          />
          {group.badge && <NavBadge badge={group.badge} collapsed />}
        </button>

        {isExpanded && (
          <div
            role="menu"
            className="absolute left-full top-0 z-50 ml-2 min-w-48 rounded-lg border border-slate-700 bg-slate-900 py-2 shadow-xl"
          >
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <ul className="space-y-1 px-2">
              {group.children.map((child) => (
                <li key={child.id}>
                  <NavLinkButton
                    item={child}
                    isActive={activeId === child.id}
                    isCollapsed={false}
                    isNested
                    onSelect={onSelectItem}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggleGroup(group.id)}
        aria-expanded={isExpanded}
        className={[
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          hasActiveChild
            ? 'bg-slate-800 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
        ].join(' ')}
      >
        <NavIcon
          name={group.icon}
          className={`h-5 w-5 shrink-0 ${hasActiveChild ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}
        />
        <span className="flex-1 truncate text-left">{group.label}</span>
        {group.badge && <NavBadge badge={group.badge} />}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isExpanded && (
        <ul className="mt-1 space-y-1 border-l border-slate-700 pl-3 ml-5">
          {group.children.map((child) => (
            <li key={child.id}>
              <NavLinkButton
                item={child}
                isActive={activeId === child.id}
                isCollapsed={false}
                isNested
                onSelect={onSelectItem}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
