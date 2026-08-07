import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Permission } from '../../types/role.types'
import { ALL_PERMISSIONS, permissionLabels } from '../../types/role.types'

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (input: {
    name: string
    description: string
    permissions: Permission[]
  }) => string | null
}

export function CreateRoleModal({ isOpen, onClose, onCreate }: CreateRoleModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    setName('')
    setDescription('')
    setPermissions([])
    setError(null)
    nameInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const togglePermission = (permission: Permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission],
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = onCreate({ name, description, permissions })
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
      aria-labelledby="create-role-modal-title"
    >
      <button
        type="button"
        aria-label="Fermer la modale"
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
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="create-role-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          Créer un rôle
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Définissez un nouveau rôle et sélectionnez les droits associés.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="role-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nom du rôle
            </label>
            <input
              ref={nameInputRef}
              id="role-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Responsable conformité"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="role-description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>
            <textarea
              id="role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="Décrivez le périmètre de ce rôle…"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Droits
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
                    {permissionLabels[permission]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Créer le rôle
          </button>
        </div>
      </form>
    </div>
  )
}
