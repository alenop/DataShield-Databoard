import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileOutput, Loader2, Plus, ShieldCheck } from 'lucide-react'
import type { DataExportsState } from '../../hooks/useDataExports'
import type { ExportBackupOption } from '../../types/dataExport.types'
import type { ExportFormat, ExportStatus } from '../../types/dataExport.types'
import { ListSearchBar } from '../ui/ListSearchBar'
import { formatBackupDate } from '../../utils/backupFormatters'
import { formatExportSize, formatExportDate, formatLinkExpiration } from '../../utils/dataExport.utils'
import { filterByListSearchQuery } from '../../utils/listSearch.utils'
import { formatScopeLabels } from '../../utils/sourceScope.utils'
import { ScopeBadges } from '../sources/ScopeBadges'
import { NewExportModal } from './NewExportModal'

interface ExportsPageProps {
  dataExports: DataExportsState
  availableExportBackups: ExportBackupOption[]
}

export function ExportsPage({ dataExports, availableExportBackups }: ExportsPageProps) {
  const { t } = useTranslation()
  const { exports, notification, createExport, downloadExport } = dataExports
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [query, setQuery] = useState('')

  const getBackupName = (id: string) =>
    availableExportBackups.find((backup) => backup.id === id)?.name ?? t('common.emptyDash')

  const filteredExports = useMemo(
    () =>
      filterByListSearchQuery(exports, query, (item) => [
        item.name,
        item.format,
        t(`formats.${item.format}`),
        formatScopeLabels(item.scopes, t),
        getBackupName(item.backupId),
        formatLinkExpiration(item.linkExpiresAt, item.status),
        t(`status.export.${item.status}`),
      ]),
    [exports, query, t, availableExportBackups],
  )

  const listCountLabel = query.trim()
    ? t('pages.exports.matchingExports', { count: filteredExports.length, total: exports.length })
    : t('common.countWithLabel', { label: t('pages.exports.history'), count: exports.length })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('pages.exports.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.exports.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('pages.exports.newExport')}
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <FileOutput className="h-4 w-4" aria-hidden="true" />
              {t('pages.exports.history')}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{listCountLabel}</p>
          </div>
          <ListSearchBar
            query={query}
            onQueryChange={setQuery}
            placeholder={t('pages.exports.searchPlaceholder')}
            ariaLabel={t('pages.exports.searchAria')}
          />
        </div>

        {exports.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.exports.noExports')}
          </p>
        ) : filteredExports.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.exports.noSearchResults')}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.exportName')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.format')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.size')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.scope')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.exportDate')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.backup')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.linkExpiresAt')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.status')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.createdAt')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {filteredExports.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="px-4 py-3">
                      <ExportFormatBadge format={item.format} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {item.status === 'preparing' ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          {t('common.calculating')}
                        </span>
                      ) : (
                        formatExportSize(item.sizeBytes)
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      <ScopeBadges scopes={item.scopes} maxVisible={3} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatExportDate(item.exportDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {getBackupName(item.backupId)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatLinkExpiration(item.linkExpiresAt, item.status)}
                    </td>
                    <td className="px-4 py-3">
                      <ExportStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatBackupDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DownloadButton
                        exportName={item.name}
                        status={item.status}
                        onDownload={() => downloadExport(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <NewExportModal
        isOpen={isModalOpen}
        backups={availableExportBackups}
        onClose={() => setIsModalOpen(false)}
        onCreate={createExport}
      />
    </div>
  )
}

interface ExportFormatBadgeProps {
  format: ExportFormat
}

const formatStyles: Record<ExportFormat, string> = {
  csv: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  json: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  sql_dump: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  parquet: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
}

function ExportFormatBadge({ format }: ExportFormatBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        formatStyles[format],
      ].join(' ')}
    >
      {t(`formats.${format}`)}
    </span>
  )
}

interface ExportStatusBadgeProps {
  status: ExportStatus
}

const statusStyles: Record<ExportStatus, string> = {
  ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  expired: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

function ExportStatusBadge({ status }: ExportStatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {status === 'preparing' && (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      )}
      {t(`status.export.${status}`)}
    </span>
  )
}

interface DownloadButtonProps {
  exportName: string
  status: ExportStatus
  onDownload: () => void
}

function DownloadButton({ exportName, status, onDownload }: DownloadButtonProps) {
  const { t } = useTranslation()
  const isDisabled = status !== 'ready'

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onDownload}
      aria-label={t('common.downloadExportAria', { name: exportName })}
      title={
        status === 'ready'
          ? t('common.secureDownload')
          : status === 'preparing'
            ? t('common.exportPreparing')
            : t('common.exportExpired')
      }
      className={[
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
        isDisabled
          ? 'cursor-not-allowed text-slate-400 dark:text-slate-500'
          : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-600 dark:hover:text-white',
      ].join(' ')}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {t('common.download')}
    </button>
  )
}
