import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RoleDefinition } from '../../types/role.types'

interface InviteUserModalProps {
  isOpen: boolean
  assignableRoles: RoleDefinition[]
  onClose: () => void
  onInvite: (email: string, roleId: string) => string | null
}

export function InviteUserModal({
  isOpen,
  assignableRoles,
  onClose,
  onInvite,
}: InviteUserModalProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    setEmail('')
    setRoleId(assignableRoles[0]?.id ?? '')
    setError(null)
    emailInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, assignableRoles, onClose])

  if (!isOpen) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = onInvite(email, roleId)
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
      aria-labelledby="invite-user-modal-title"
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
          id="invite-user-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          {t('pages.users.inviteModal.title')}
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.users.inviteModal.description')}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="invite-email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.email')}
            </label>
            <input
              ref={emailInputRef}
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('pages.users.inviteModal.emailPlaceholder')}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.role')}
            </label>
            <select
              id="invite-role"
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
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
            disabled={assignableRoles.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('pages.users.inviteModal.send')}
          </button>
        </div>
      </form>
    </div>
  )
}
