import { useTranslation } from 'react-i18next'
import type { SourceScope } from '../../types/sourceScope.types'
import { getScopeLabel } from '../../utils/sourceScope.utils'

interface ScopeBadgesProps {
  scopes: SourceScope[]
  maxVisible?: number
}

export function ScopeBadges({ scopes, maxVisible = 2 }: ScopeBadgesProps) {
  const { t } = useTranslation()

  if (scopes.length === 0) {
    return <span className="text-slate-400">{t('common.emptyDash')}</span>
  }

  const visible = scopes.slice(0, maxVisible)
  const remaining = scopes.length - visible.length

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((scope) => (
        <span
          key={scope}
          className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {getScopeLabel(scope, t)}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          +{remaining}
        </span>
      )}
    </div>
  )
}
