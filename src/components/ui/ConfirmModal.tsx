import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { ConfirmActionType } from '../../hooks/useConfirmModal'
import { confirmModalConfig } from '../../hooks/useConfirmModal'

interface ConfirmModalProps {
  isOpen: boolean
  action: ConfirmActionType | null
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmModal({ isOpen, action, onClose, onConfirm }: ConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen || !action) return null

  const config = confirmModalConfig[action]
  const isDanger = config.variant === 'danger'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
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
          id="confirm-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          {config.title}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {config.message}
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
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
