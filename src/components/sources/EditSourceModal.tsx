import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BackupSource, BackupSourceInput } from '../../types/backupSource.types'
import type { SourceScope } from '../../types/sourceScope.types'
import { ScopeListEditor } from './ScopeListEditor'

interface EditSourceModalProps {
  isOpen: boolean
  source: BackupSource | null
  onClose: () => void
  onSave: (sourceId: string, input: BackupSourceInput) => string | null
}

export function EditSourceModal({ isOpen, source, onClose, onSave }: EditSourceModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [scopes, setScopes] = useState<SourceScope[]>([])
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen || !source) return

    setName(source.name)
    setEnvironment(source.environment)
    setApiEndpoint(source.apiEndpoint)
    setScopes(source.scopes)
    setError(null)
    nameInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, source, onClose])

  if (!isOpen || !source) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = onSave(source.id, {
      name,
      environment,
      apiEndpoint,
      scopes,
    })
    if (validationError) {
      setError(validationError)
      return
    }

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-source-modal-title"
    >
      <button
        type="button"
        aria-label={t('common.closeModal')}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="edit-source-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          {t('pages.sources.editModal.title')}
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.sources.editModal.description')}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="edit-source-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.name')}
            </label>
            <input
              ref={nameInputRef}
              id="edit-source-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="edit-source-environment"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.environment')}
            </label>
            <input
              id="edit-source-environment"
              type="text"
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="edit-source-api-endpoint"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.apiEndpoint')}
            </label>
            <input
              id="edit-source-api-endpoint"
              type="url"
              value={apiEndpoint}
              onChange={(event) => setApiEndpoint(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <ScopeListEditor
            id="edit-source-scopes"
            scopes={scopes}
            onChange={setScopes}
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
