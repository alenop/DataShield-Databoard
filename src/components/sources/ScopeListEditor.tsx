import { useState, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { normalizeScopes } from '../../utils/backupSource.utils'

interface ScopeListEditorProps {
  id: string
  scopes: string[]
  onChange: (scopes: string[]) => void
  disabled?: boolean
}

export function ScopeListEditor({ id, scopes, onChange, disabled = false }: ScopeListEditorProps) {
  const [draft, setDraft] = useState('')

  const addScope = () => {
    const trimmed = draft.trim()
    if (!trimmed) return

    const next = normalizeScopes([...scopes, trimmed])
    onChange(next)
    setDraft('')
  }

  const removeScope = (scopeToRemove: string) => {
    onChange(scopes.filter((scope) => scope !== scopeToRemove))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addScope()
    }
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        Périmètres d&apos;export
      </label>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Définissez les périmètres disponibles lors de la création d&apos;un export.
      </p>

      <div className="mt-2 flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex. Contacts, Opportunités…"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <button
          type="button"
          onClick={addScope}
          disabled={disabled || !draft.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter
        </button>
      </div>

      {scopes.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {scopes.map((scope) => (
            <li key={scope}>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {scope}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeScope(scope)}
                    aria-label={`Retirer ${scope}`}
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
          Ajoutez au moins un périmètre pour activer les exports.
        </p>
      )}
    </div>
  )
}
