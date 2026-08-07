import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { BackupSource } from '../../types/backupSource.types'
import type { CreateDataExportInput, ExportFormat } from '../../types/dataExport.types'
import { EXPORT_FORMATS, exportFormatLabels } from '../../types/dataExport.types'
import { generateExportFileName, getTodayExportDate } from '../../utils/dataExport.utils'

interface NewExportModalProps {
  isOpen: boolean
  sources: BackupSource[]
  onClose: () => void
  onCreate: (input: CreateDataExportInput) => string | null
}

export function NewExportModal({ isOpen, sources, onClose, onCreate }: NewExportModalProps) {
  const [name, setName] = useState('')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [sourceId, setSourceId] = useState('')
  const [scope, setScope] = useState('')
  const [exportDate, setExportDate] = useState(getTodayExportDate())
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const selectedSource = sources.find((source) => source.id === sourceId)
  const availableScopes = selectedSource?.scopes ?? []

  useEffect(() => {
    if (!isOpen) return

    const initialSource = sources[0]
    setName('Export_Contacts_Salesforce')
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
  }, [isOpen, sources, onClose])

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
      scope,
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
        aria-label="Fermer la modale"
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
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="new-export-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          Nouvel export à la demande
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Générez un export pour analyse externe ou migration de données.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="export-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nom de l&apos;export
            </label>
            <input
              ref={nameInputRef}
              id="export-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Export_Contacts_Salesforce_Q2"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            {previewName && (
              <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                Fichier : {previewName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="export-date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Date de l&apos;export
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
              Format
            </label>
            <select
              id="export-format"
              value={format}
              onChange={(event) => setFormat(event.target.value as ExportFormat)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {EXPORT_FORMATS.map((item) => (
                <option key={item} value={item}>
                  {exportFormatLabels[item]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="export-source"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Source
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
              Périmètre
            </label>
            <select
              id="export-scope"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              disabled={availableScopes.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {availableScopes.length === 0 ? (
                <option value="">Aucun périmètre configuré</option>
              ) : (
                availableScopes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              )}
            </select>
            {availableScopes.length === 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Ajoutez des périmètres à la source depuis la page Sources.
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
            Annuler
          </button>
          <button
            type="submit"
            disabled={sources.length === 0 || availableScopes.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lancer l&apos;export
          </button>
        </div>
      </form>
    </div>
  )
}
