import { useState, type FormEvent } from 'react'
import { Loader2, Pencil, Plug, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import type { BackupSource, BackupSourceStatus } from '../../types/backupSource.types'
import type { SourceScope } from '../../types/sourceScope.types'
import { EditSourceModal } from './EditSourceModal'
import { ScopeBadges } from './ScopeBadges'
import { ScopeListEditor } from './ScopeListEditor'

interface SourcesPageProps {
  backupSources: BackupSourcesState
}

interface SourceFormState {
  name: string
  environment: string
  apiEndpoint: string
  scopes: SourceScope[]
}

const emptyForm: SourceFormState = {
  name: '',
  environment: '',
  apiEndpoint: '',
  scopes: [],
}

export function SourcesPage({ backupSources }: SourcesPageProps) {
  const { t } = useTranslation()
  const { sources, testingSourceId, notification, addSource, updateSource, deleteSource, testConnection } =
    backupSources
  const [form, setForm] = useState<SourceFormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [editingSource, setEditingSource] = useState<BackupSource | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = addSource(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setForm(emptyForm)
    setError(null)
  }

  const handleDelete = (id: string) => {
    deleteSource(id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pages.sources.title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.sources.subtitle')}
        </p>
      </div>

      {notification && (
        <div
          role="status"
          className={[
            'rounded-lg border px-4 py-3 text-sm',
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
          ].join(' ')}
        >
          {notification.message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('pages.sources.addSource')}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="source-name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('common.name')}
              </label>
              <input
                id="source-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder={t('pages.sources.namePlaceholder')}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="source-environment"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('common.environment')}
              </label>
              <input
                id="source-environment"
                type="text"
                value={form.environment}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, environment: event.target.value }))
                }
                placeholder={t('pages.sources.environmentPlaceholder')}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="source-api-endpoint"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t('common.apiEndpoint')}
              </label>
              <input
                id="source-api-endpoint"
                type="url"
                value={form.apiEndpoint}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, apiEndpoint: event.target.value }))
                }
                placeholder={t('pages.sources.apiEndpointPlaceholder')}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <ScopeListEditor
                id="source-scopes"
                scopes={form.scopes}
                onChange={(scopes) => setForm((prev) => ({ ...prev, scopes }))}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('common.add')}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('common.countWithLabel', { label: t('pages.sources.configuredSources'), count: sources.length })}
        </h2>

        {sources.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.sources.noSources')}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.name')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.environment')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.scopes')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.apiEndpoint')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.status')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {sources.map((source) => {
                  const isTesting = testingSourceId === source.id

                  return (
                    <tr key={source.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {source.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {source.environment}
                      </td>
                      <td className="px-4 py-3">
                        <ScopeBadges scopes={source.scopes} />
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
                            onClick={() => setEditingSource(source)}
                            aria-label={t('common.editAria', { name: source.name })}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={testingSourceId !== null}
                            onClick={() => testConnection(source.id)}
                            aria-label={t('common.testConnectionAria', { name: source.name })}
                            className={[
                              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                              isTesting
                                ? 'cursor-wait bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-600 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
                            ].join(' ')}
                          >
                            {isTesting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Plug className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            {isTesting ? t('common.testing') : t('common.testConnection')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(source.id)}
                            aria-label={t('common.deleteAria', { name: source.name })}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <EditSourceModal
        isOpen={editingSource !== null}
        source={editingSource}
        onClose={() => setEditingSource(null)}
        onSave={updateSource}
      />
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
  const { t } = useTranslation()

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {t(`status.source.${status}`)}
    </span>
  )
}
