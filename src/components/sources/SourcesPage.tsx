import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import type { BackupSource, BackupSourceStatus } from '../../types/backupSource.types'
import { backupSourceStatusLabels } from '../../types/backupSource.types'

interface SourcesPageProps {
  backupSources: BackupSourcesState
}

interface SourceFormState {
  name: string
  environment: string
  apiEndpoint: string
}

const emptyForm: SourceFormState = {
  name: '',
  environment: '',
  apiEndpoint: '',
}

export function SourcesPage({ backupSources }: SourcesPageProps) {
  const { sources, addSource, editSource, deleteSource } = backupSources
  const [form, setForm] = useState<SourceFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isEditing = editingId !== null

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError(null)
  }

  const startEdit = (source: BackupSource) => {
    setEditingId(source.id)
    setForm({
      name: source.name,
      environment: source.environment,
      apiEndpoint: source.apiEndpoint,
    })
    setError(null)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = isEditing
      ? editSource(editingId, form)
      : addSource(form)

    if (validationError) {
      setError(validationError)
      return
    }

    resetForm()
  }

  const handleDelete = (id: string) => {
    deleteSource(id)
    if (editingId === id) resetForm()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sources</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gérez les sources de sauvegarde disponibles dans la liste déroulante.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {isEditing ? 'Modifier la source' : 'Ajouter une source'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="source-name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Nom
              </label>
              <input
                id="source-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ex. Salesforce Production Core"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="source-environment"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Environnement
              </label>
              <input
                id="source-environment"
                type="text"
                value={form.environment}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, environment: event.target.value }))
                }
                placeholder="Ex. Production"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="source-api-endpoint"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Endpoint API (HTTPS)
              </label>
              <input
                id="source-api-endpoint"
                type="url"
                value={form.apiEndpoint}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, apiEndpoint: event.target.value }))
                }
                placeholder="https://org-prod.my.salesforce.com/services/data/v58.0"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {isEditing ? (
                <>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Enregistrer
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Ajouter
                </>
              )}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Sources configurées ({sources.length})
        </h2>

        {sources.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Aucune source configurée. Ajoutez-en une ci-dessus.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Nom
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Environnement
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Endpoint API
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Statut
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {source.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {source.environment}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {source.apiEndpoint}
                    </td>
                    <td className="px-4 py-3">
                      <SourceStatusBadge status={source.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(source)}
                          aria-label={`Modifier ${source.name}`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(source.id)}
                          aria-label={`Supprimer ${source.name}`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

interface SourceStatusBadgeProps {
  status: BackupSourceStatus
}

const statusStyles: Record<BackupSourceStatus, string> = {
  CONNECTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  DISCONNECTED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  ERROR: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

function SourceStatusBadge({ status }: SourceStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {backupSourceStatusLabels[status]}
    </span>
  )
}
