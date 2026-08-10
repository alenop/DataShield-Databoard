import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { BackupSource } from '../../types/backupSource.types'
import type { CreateDataExportInput, ExportFormat } from '../../types/dataExport.types'
import { EXPORT_FORMATS } from '../../types/dataExport.types'
import type { SourceScope } from '../../types/sourceScope.types'
import { generateExportFileName, getTodayExportDate } from '../../utils/dataExport.utils'
import { getScopeLabel } from '../../utils/sourceScope.utils'

interface NewExportModalProps {
  isOpen: boolean
  sources: BackupSource[]
  onClose: () => void
  onCreate: (input: CreateDataExportInput) => string | null
}

export function NewExportModal({ isOpen, sources, onClose, onCreate }: NewExportModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [sourceId, setSourceId] = useState('')
  const [scope, setScope] = useState<SourceScope | ''>('')
  const [exportDate, setExportDate] = useState(getTodayExportDate())
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const selectedSource = sources.find((source) => source.id === sourceId)
  const availableScopes = selectedSource?.scopes ?? []

  useEffect(() => {
    if (!isOpen) return

    const initialSource = sources[0]
    setName(t('pages.exports.modal.defaultName'))
    setFormat('csv')
    setSourceId(initialSource?.id ?? '')
    setScope(initialSource?.scopes[0] ?? '')
    setExportDate(getTodayExportDate())
    setError(null)
    nameInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, sources, onClose, t])

  useEffect(() => {
    if (!selectedSource) {
      setScope('')
      return
    }

    setScope((current) => {
      if (selectedSource.scopes.some((item) => item === current)) return current
      return selectedSource.scopes[0] ?? ''
    })
  }, [selectedSource])

  if (!isOpen) return null

  const previewName = name.trim()
    ? generateExportFileName(name, format)
    : ''

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = onCreate({
      name: previewName || name,
      format,
      sourceId,
      scope: scope as SourceScope,
      exportDate,
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
      aria-labelledby="new-export-modal-title"
    >
      <button
        type="button"
        aria-label={t('common.closeModal')}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
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
          id="new-export-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          {t('pages.exports.modal.title')}
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.exports.modal.description')}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="export-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('pages.exports.modal.exportNameLabel')}
            </label>
            <input
              ref={nameInputRef}
              id="export-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('pages.exports.modal.exportNamePlaceholder')}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            {previewName && (
              <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                {t('common.file', { name: previewName })}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="export-date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('pages.exports.modal.exportDateLabel')}
            </label>
            <input
              id="export-date"
              type="date"
              value={exportDate}
              onChange={(event) => setExportDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="export-format"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.format')}
            </label>
            <select
              id="export-format"
              value={format}
              onChange={(event) => setFormat(event.target.value as ExportFormat)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {EXPORT_FORMATS.map((item) => (
                <option key={item} value={item}>
                  {t(`formats.${item}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="export-source"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.source')}
            </label>
            <select
              id="export-source"
              value={sourceId}
              onChange={(event) => setSourceId(event.target.value)}
              disabled={sources.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="export-scope"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.scope')}
            </label>
            <select
              id="export-scope"
              value={scope}
              onChange={(event) => setScope(event.target.value as SourceScope)}
              disabled={availableScopes.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {availableScopes.length === 0 ? (
                <option value="">{t('pages.exports.modal.noScope')}</option>
              ) : (
                availableScopes.map((item) => (
                  <option key={item} value={item}>
                    {getScopeLabel(item, t)}
                  </option>
                ))
              )}
            </select>
            {availableScopes.length === 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {t('pages.exports.modal.noScopeHint')}
              </p>
            )}
          </div>
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
            disabled={sources.length === 0 || availableScopes.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('pages.exports.modal.launch')}
          </button>
        </div>
      </form>
    </div>
  )
}
