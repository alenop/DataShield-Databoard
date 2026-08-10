import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileInput, Loader2, RotateCcw } from 'lucide-react'
import type { RestoreJobsState } from '../../hooks/useRestoreJobs'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import type { RestoreBackupOption } from '../../types/restoreJob.types'
import type { RestoreJobStatus } from '../../types/restoreJob.types'
import { formatBackupDate } from '../../utils/backupFormatters'
import { LaunchRestoreModal } from './LaunchRestoreModal'

interface ImportsPageProps {
  restoreJobs: RestoreJobsState
  backupSources: BackupSourcesState
  availableBackups: RestoreBackupOption[]
}

export function ImportsPage({ restoreJobs, backupSources, availableBackups }: ImportsPageProps) {
  const { t, i18n } = useTranslation()
  const { restoreJobs: jobs, notification, launchRestore } = restoreJobs
  const { sources } = backupSources
  const [isModalOpen, setIsModalOpen] = useState(false)

  const targets = sources.map((source) => ({
    id: source.id,
    name: `${source.name} (${source.environment})`,
  }))

  const getTargetName = (targetSourceId: string) =>
    targets.find((target) => target.id === targetSourceId)?.name ?? t('common.emptyDash')

  const formatRestoreProgress = (restoredCount: number, totalCount: number) =>
    t('common.restoreProgress', {
      restored: restoredCount.toLocaleString(i18n.language),
      total: totalCount.toLocaleString(i18n.language),
    })

  const formatRestoreBackupDate = (backupDate: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(backupDate))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('pages.imports.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.imports.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t('pages.imports.launchRestore')}
        </button>
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
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <FileInput className="h-4 w-4" aria-hidden="true" />
          {t('common.countWithLabel', { label: t('pages.imports.operations'), count: jobs.length })}
        </h2>

        {jobs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.imports.noOperations')}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.restoreName')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.backupSourceColumn')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.target')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.status')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.restoredRecords')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.launchedAt')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {job.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      <span>{t('common.backupFrom', { date: formatRestoreBackupDate(job.backupDate) })}</span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-500">
                        {job.backupName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {getTargetName(job.targetSourceId)}
                    </td>
                    <td className="px-4 py-3">
                      <RestoreStatusBadge status={job.status} />
                      {job.status === 'failure' && job.errorMessage && (
                        <p className="mt-1 max-w-xs text-xs text-red-600 dark:text-red-400">
                          {job.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {job.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          {formatRestoreProgress(job.restoredCount, job.totalCount)}
                        </span>
                      ) : (
                        formatRestoreProgress(job.restoredCount, job.totalCount)
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatBackupDate(job.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <LaunchRestoreModal
        isOpen={isModalOpen}
        backups={availableBackups}
        targets={targets}
        onClose={() => setIsModalOpen(false)}
        onLaunch={launchRestore}
      />
    </div>
  )
}

interface RestoreStatusBadgeProps {
  status: RestoreJobStatus
}

const statusStyles: Record<RestoreJobStatus, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  failure: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

function RestoreStatusBadge({ status }: RestoreStatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {status === 'in_progress' && (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      )}
      {t(`status.restore.${status}`)}
    </span>
  )
}
