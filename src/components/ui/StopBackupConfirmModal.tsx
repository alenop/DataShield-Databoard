import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface StopBackupConfirmModalProps {
  isOpen: boolean
  backupName: string | null
  onClose: () => void
  onConfirm: () => void
}

export function StopBackupConfirmModal({
  isOpen,
  backupName,
  onClose,
  onConfirm,
}: StopBackupConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen || !backupName) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stop-backup-modal-title"
    >
      <button
        type="button"
        aria-label="Fermer la modale"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="stop-backup-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          Arrêter la sauvegarde
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Voulez-vous vraiment arrêter la sauvegarde{' '}
          <span className="font-medium text-slate-900 dark:text-white">{backupName}</span>{' '}
          ? L&apos;opération sera interrompue et marquée en erreur.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Annuler
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Confirmer l&apos;arrêt
          </button>
        </div>
      </div>
    </div>
  )
}
