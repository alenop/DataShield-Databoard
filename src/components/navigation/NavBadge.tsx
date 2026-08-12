import type { NavBadge as NavBadgeType } from '../../types/navigation.types'

interface NavBadgeProps {
  badge: NavBadgeType
  collapsed?: boolean
}

const variantClasses: Record<NonNullable<NavBadgeType['variant']>, string> = {
  default: 'bg-slate-600 text-white',
  danger: 'bg-red-500 text-white',
  warning: 'bg-amber-400 text-slate-900',
  info: 'bg-blue-500 text-white',
}

export function NavBadge({ badge, collapsed = false }: NavBadgeProps) {
  const variant = badge.variant ?? 'default'
  const displayCount = badge.count > 99 ? '99+' : String(badge.count)

  return (
    <span
      className={[
        'inline-flex items-center justify-center font-semibold tabular-nums',
        variantClasses[variant],
        collapsed
          ? 'absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[10px] rounded-full'
          : 'min-w-5 h-5 px-1.5 text-xs rounded-full',
      ].join(' ')}
      aria-label={`${badge.count} notification${badge.count > 1 ? 's' : ''}`}
    >
      {displayCount}
    </span>
  )
}
