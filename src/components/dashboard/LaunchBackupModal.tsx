import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BackupSource } from '../../types/backupSource.types'

interface LaunchBackupModalProps {
  isOpen: boolean
  sources: BackupSource[]
  onClose: () => void
  onLaunch: (name: string, sourceId: string) => void
}

export function LaunchBackupModal({
  isOpen,
  sources,
  onClose,
  onLaunch,
}: LaunchBackupModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    setName('')
    setSourceId(sources[0]?.id ?? '')
    setError(null)
    nameInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, sources, onClose])

  if (!isOpen) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      setError(t('validation.backupNameRequired'))
      return
    }
    if (!sourceId) {
      setError(t('validation.sourceRequired'))
      return
    }

    onLaunch(name.trim(), sourceId)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-backup-modal-title"
    >
      <button
        type="button"
        aria-label={t('common.closeModal')}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
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
          id="launch-backup-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          {t('pages.backups.launchModal.title')}
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.backups.launchModal.description')}
        </p>

        {sources.length === 0 ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            {t('pages.backups.launchModal.noSources')}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="backup-name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('pages.backups.launchModal.backupNameLabel')}
              </label>
              <input
                ref={nameInputRef}
                id="backup-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('pages.backups.launchModal.backupNamePlaceholder')}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="backup-source"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('common.source')}
              </label>
              <select
                id="backup-source"
                value={sourceId}
                onChange={(event) => setSourceId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
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
            disabled={sources.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('pages.backups.launchModal.start')}
          </button>
        </div>
      </form>
    </div>
  )
}
