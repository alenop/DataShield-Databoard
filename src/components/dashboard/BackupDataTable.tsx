import type { BackupRecord } from '../../types/backup.types'
import {
  formatBackupDate,
  formatBackupDuration,
  formatBackupSize,
} from '../../utils/backupFormatters'
import { BackupStatusBadge } from './BackupStatusBadge'

interface BackupDataTableProps {
  records: BackupRecord[]
}

export function BackupDataTable({ records }: BackupDataTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune sauvegarde ne correspond à ce filtre.</p>
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
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{record.name}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{record.source}</td>
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
                <BackupStatusBadge status={record.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
