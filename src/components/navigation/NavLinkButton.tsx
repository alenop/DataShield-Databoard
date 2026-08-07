import type { NavLinkItem } from '../../types/navigation.types'
import { NavIcon } from '../../utils/navIcons'
import { NavBadge } from './NavBadge'

interface NavLinkButtonProps {
  item: NavLinkItem
  isActive: boolean
  isCollapsed: boolean
  isNested?: boolean
  onSelect: (id: string) => void
}

export function NavLinkButton({
  item,
  isActive,
  isCollapsed,
  isNested = false,
  onSelect,
}: NavLinkButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : undefined}
      className={[
        'group relative flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors',
        isNested ? 'px-3 py-2' : 'px-3 py-2.5',
        isCollapsed && !isNested ? 'justify-center px-2' : '',
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
      ].join(' ')}
    >
      {item.icon && (
        <NavIcon
          name={item.icon}
          className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
        />
      )}

      {!isCollapsed && <span className="flex-1 truncate text-left">{item.label}</span>}

      {item.badge && (
        <NavBadge badge={item.badge} collapsed={isCollapsed && !isNested} />
      )}
    </button>
  )
}
