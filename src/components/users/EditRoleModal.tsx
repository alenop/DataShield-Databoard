import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Permission, RoleDefinition } from '../../types/role.types'
import { ALL_PERMISSIONS } from '../../types/role.types'

interface EditRoleModalProps {
  isOpen: boolean
  role: RoleDefinition | null
  onClose: () => void
  onSave: (roleId: string, permissions: Permission[]) => string | null
}

export function EditRoleModal({ isOpen, role, onClose, onSave }: EditRoleModalProps) {
  const { t } = useTranslation()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !role) return

    setPermissions(role.permissions)
    setError(null)

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, role, onClose])

  if (!isOpen || !role) return null

  const togglePermission = (permission: Permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission],
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = onSave(role.id, permissions)
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
      aria-labelledby="edit-role-modal-title"
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
          id="edit-role-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          {t('pages.users.editRoleModal.title', { name: role.name })}
        </h2>

        {role.description && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{role.description}</p>
        )}

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('common.assignedPermissions')}
          </legend>
          <div className="mt-2 space-y-2">
            {ALL_PERMISSIONS.map((permission) => (
              <label
                key={permission}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {t(`pages.users.permissions.${permission}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

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
