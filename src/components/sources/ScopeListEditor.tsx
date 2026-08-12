import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SOURCE_SCOPES, type SourceScope } from '../../types/sourceScope.types'
import { getScopeLabel } from '../../utils/sourceScope.utils'

interface ScopeListEditorProps {
  id: string
  scopes: SourceScope[]
  onChange: (scopes: SourceScope[]) => void
  disabled?: boolean
  availableScopes?: SourceScope[]
  label?: string
  hint?: string
  requiredMessage?: string
}

export function ScopeListEditor({
  id,
  scopes,
  onChange,
  disabled = false,
  availableScopes,
  label,
  hint,
  requiredMessage,
}: ScopeListEditorProps) {
  const { t } = useTranslation()
  const [selectedScope, setSelectedScope] = useState<SourceScope | ''>('')

  const scopePool = availableScopes ?? SOURCE_SCOPES

  const availableToAdd = useMemo(
    () => scopePool.filter((scope) => !scopes.includes(scope)),
    [scopePool, scopes],
  )

  const addScope = () => {
    if (!selectedScope || scopes.includes(selectedScope)) return
    onChange([...scopes, selectedScope])
    setSelectedScope('')
  }

  const removeScope = (scopeToRemove: SourceScope) => {
    onChange(scopes.filter((scope) => scope !== scopeToRemove))
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label ?? t('pages.sources.scopesLabel')}
      </label>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {hint ?? t('pages.sources.scopesHint')}
      </p>

      <div className="mt-2 flex gap-2">
        <select
          id={id}
          value={selectedScope}
          disabled={disabled || availableToAdd.length === 0}
          onChange={(event) => setSelectedScope(event.target.value as SourceScope | '')}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="">{t('pages.sources.scopesSelectPlaceholder')}</option>
          {availableToAdd.map((scope) => (
            <option key={scope} value={scope}>
              {getScopeLabel(scope, t)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addScope}
          disabled={disabled || !selectedScope}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('common.add')}
        </button>
      </div>

      {scopes.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {scopes.map((scope) => (
            <li key={scope}>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {getScopeLabel(scope, t)}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeScope(scope)}
                    aria-label={t('common.removeScopeAria', { scope: getScopeLabel(scope, t) })}
                    className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          {requiredMessage ?? t('pages.sources.scopesRequired')}
        </p>
      )}
    </div>
  )
}
