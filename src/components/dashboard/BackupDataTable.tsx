import { RotateCcw, Square } from 'lucide-react'
import type { BackupRecord } from '../../types/backup.types'
import type { BackupSource } from '../../types/backupSource.types'
import { getBackupSourceLabel } from '../../utils/backupRecord.utils'
import {
  formatBackupDate,
  formatBackupDuration,
  formatBackupDisplayName,
  formatBackupSize,
} from '../../utils/backupFormatters'
import { BackupStatusBadge } from './BackupStatusBadge'

interface BackupDataTableProps {
  records: BackupRecord[]
  sources: BackupSource[]
  selectedId: string | null
  getProgressPercent: (sizeGb: number) => number
  onSelect: (id: string) => void
  onRetry: (id: string) => void
  onStop: (id: string) => void
}

export function BackupDataTable({
  records,
  sources,
  selectedId,
  getProgressPercent,
  onSelect,
  onRetry,
  onStop,
}: BackupDataTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aucune sauvegarde ne correspond aux critères sélectionnés.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
              Nom
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
              Source
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
              Date
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
              Volume
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
              Durée
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
          {records.map((record) => {
            const isSelected = selectedId === record.id
            const isRetryDisabled = record.status === 'in_progress'
            const isStopEnabled = record.status === 'in_progress'
            const displayName = formatBackupDisplayName(record.name, record.scheduleFrequency)

            return (
              <tr
                key={record.id}
                onClick={() => onSelect(record.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(record.id)
                  }
                }}
                tabIndex={0}
                aria-selected={isSelected}
                className={[
                  'cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                  isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : '',
                ].join(' ')}
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {displayName}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {getBackupSourceLabel(record, sources)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                  {formatBackupDate(record.date)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                  {formatBackupSize(record.sizeGb)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                  {formatBackupDuration(record.durationMinutes)}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1.5">
                    <BackupStatusBadge status={record.status} />
                    {record.status === 'in_progress' && (
                      <div
                        className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                        role="progressbar"
                        aria-valuenow={getProgressPercent(record.sizeGb)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${getProgressPercent(record.sizeGb)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={!isStopEnabled}
                      onClick={(event) => {
                        event.stopPropagation()
                        onStop(record.id)
                      }}
                      aria-label={`Arrêter la sauvegarde ${displayName}`}
                      className={[
                        'inline-flex h-7 w-7 items-center justify-center rounded-sm transition-colors',
                        isStopEnabled
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600',
                      ].join(' ')}
                    >
                      <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={isRetryDisabled}
                      onClick={(event) => {
                        event.stopPropagation()
                        onRetry(record.id)
                      }}
                      aria-label={`Relancer la sauvegarde ${displayName}`}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        isRetryDisabled
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-600 dark:hover:text-white',
                      ].join(' ')}
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Relancer
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
