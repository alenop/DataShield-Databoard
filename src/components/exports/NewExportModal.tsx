import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { CreateDataExportInput, ExportBackupOption, ExportFormat } from '../../types/dataExport.types'
import { EXPORT_FORMATS } from '../../types/dataExport.types'
import type { SourceScope } from '../../types/sourceScope.types'
import { formatBackupDate } from '../../utils/backupFormatters'
import { generateExportFileName, getTodayExportDate } from '../../utils/dataExport.utils'
import { getExportScopeOptions } from '../../utils/sourceScope.utils'
import { ScopeListEditor } from '../sources/ScopeListEditor'

interface NewExportModalProps {
  isOpen: boolean
  backups: ExportBackupOption[]
  onClose: () => void
  onCreate: (input: CreateDataExportInput) => string | null
}

export function NewExportModal({ isOpen, backups, onClose, onCreate }: NewExportModalProps) {
  const { t, i18n } = useTranslation()
  const [name, setName] = useState('')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [backupId, setBackupId] = useState('')
  const [scopes, setScopes] = useState<SourceScope[]>([])
  const [exportDate, setExportDate] = useState(getTodayExportDate())
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const selectedBackup = backups.find((backup) => backup.id === backupId)
  const availableScopes = selectedBackup ? getExportScopeOptions(selectedBackup.scopes) : []

  useEffect(() => {
    if (!isOpen) return

    const initialBackup = backups[0]
    setName(t('pages.exports.modal.defaultName'))
    setFormat('csv')
    setBackupId(initialBackup?.id ?? '')
    setScopes(() => {
      if (!initialBackup) return []
      const options = getExportScopeOptions(initialBackup.scopes)
      return options[0] ? [options[0]] : []
    })
    setExportDate(getTodayExportDate())
    setError(null)
    nameInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, backups, onClose, t])

  useEffect(() => {
    if (!selectedBackup) {
      setScopes([])
      return
    }

    setScopes((current) => {
      const options = getExportScopeOptions(selectedBackup.scopes)
      const valid = current.filter((scope) => options.includes(scope))
      if (valid.length > 0) return valid
      return options[0] ? [options[0]] : []
    })
  }, [selectedBackup])

  if (!isOpen) return null

  const previewName = name.trim() ? generateExportFileName(name, format) : ''

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (scopes.length === 0) {
      setError(t('validation.exportScopeRequired'))
      return
    }

    const validationError = onCreate({
      name: previewName || name,
      format,
      backupId,
      scopes,
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

        {backups.length === 0 ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            {t('pages.exports.modal.noBackups')}
          </p>
        ) : (
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
                htmlFor="export-backup"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('common.backup')}
              </label>
              <select
                id="export-backup"
                value={backupId}
                onChange={(event) => setBackupId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {backups.map((backup) => (
                  <option key={backup.id} value={backup.id}>
                    {backup.name} — {formatBackupDate(backup.date, i18n.language)}
                  </option>
                ))}
              </select>
              {selectedBackup && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t('common.source')}: {selectedBackup.sourceName}
                </p>
              )}
            </div>

            <ScopeListEditor
              id="export-scopes"
              scopes={scopes}
              onChange={setScopes}
              availableScopes={availableScopes}
              disabled={availableScopes.length === 0}
              label={t('pages.exports.modal.exportScopeLabel')}
              hint={t('pages.exports.modal.exportScopeHint')}
              requiredMessage={t('validation.exportScopeRequired')}
            />
          </div>
        )}

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
            disabled={backups.length === 0 || availableScopes.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('pages.exports.modal.launch')}
          </button>
        </div>
      </form>
    </div>
  )
}
