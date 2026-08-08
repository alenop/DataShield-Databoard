import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { CreateRestoreJobInput, RestoreBackupOption, RestoreTargetOption } from '../../types/restoreJob.types'
import { filterRestoreBackupsByTarget, formatRestoreBackupSource } from '../../utils/restoreJob.utils'

interface LaunchRestoreModalProps {
  isOpen: boolean
  backups: RestoreBackupOption[]
  targets: RestoreTargetOption[]
  onClose: () => void
  onLaunch: (input: CreateRestoreJobInput) => string | null
}

export function LaunchRestoreModal({
  isOpen,
  backups,
  targets,
  onClose,
  onLaunch,
}: LaunchRestoreModalProps) {
  const [name, setName] = useState('')
  const [backupId, setBackupId] = useState('')
  const [targetSourceId, setTargetSourceId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const backupsForTarget = useMemo(
    () => filterRestoreBackupsByTarget(backups, targetSourceId),
    [backups, targetSourceId],
  )

  useEffect(() => {
    if (!isOpen) return

    const initialTargetId = targets[0]?.id ?? ''
    const initialBackups = filterRestoreBackupsByTarget(backups, initialTargetId)

    setName('Restauration Pistes & Contacts')
    setTargetSourceId(initialTargetId)
    setBackupId(initialBackups[0]?.id ?? '')
    setError(null)
    nameInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, backups, targets, onClose])

  useEffect(() => {
    if (!isOpen || !targetSourceId) return

    setBackupId((currentId) => {
      const isStillValid = backupsForTarget.some((backup) => backup.id === currentId)
      return isStillValid ? currentId : (backupsForTarget[0]?.id ?? '')
    })
  }, [isOpen, targetSourceId, backupsForTarget])

  if (!isOpen) return null

  const handleTargetChange = (nextTargetId: string) => {
    setTargetSourceId(nextTargetId)
    setError(null)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = onLaunch({
      name,
      backupId,
      targetSourceId,
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
      aria-labelledby="launch-restore-modal-title"
    >
      <button
        type="button"
        aria-label="Fermer la modale"
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
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="launch-restore-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          Lancer une restauration
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Réinjectez des données depuis une sauvegarde vers une cible Salesforce.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="restore-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nom de la restauration
            </label>
            <input
              ref={nameInputRef}
              id="restore-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Restauration Pistes & Contacts"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="restore-target"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Cible de restauration
            </label>
            <select
              id="restore-target"
              value={targetSourceId}
              onChange={(event) => handleTargetChange(event.target.value)}
              disabled={targets.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="restore-backup"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Sauvegarde source
            </label>
            <select
              id="restore-backup"
              value={backupId}
              onChange={(event) => setBackupId(event.target.value)}
              disabled={backupsForTarget.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {backupsForTarget.length === 0 ? (
                <option value="">Aucune sauvegarde pour cette cible</option>
              ) : (
                backupsForTarget.map((backup) => (
                  <option key={backup.id} value={backup.id}>
                    {formatRestoreBackupSource(backup.date, backup.name)}
                  </option>
                ))
              )}
            </select>
            {backupsForTarget.length === 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Aucune sauvegarde réussie n&apos;est disponible pour cette cible.
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
            disabled={backupsForTarget.length === 0 || targets.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lancer la restauration
          </button>
        </div>
      </form>
    </div>
  )
}
