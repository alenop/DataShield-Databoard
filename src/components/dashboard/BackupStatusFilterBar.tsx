import type { BackupRecordsState } from '../../hooks/useBackupRecords'
import type { BackupStatusFilter } from '../../types/backup.types'
import { backupStatusLabels } from '../../types/backup.types'

interface BackupStatusFilterProps {
  filters: BackupRecordsState
}

const filterOptions: { value: BackupStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'success', label: backupStatusLabels.success },
  { value: 'in_progress', label: backupStatusLabels.in_progress },
  { value: 'failure', label: backupStatusLabels.failure },
]

export function BackupStatusFilterBar({ filters }: BackupStatusFilterProps) {
  const { statusFilter, setStatusFilter, statusCounts } = filters

  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((option) => {
        const isActive = statusFilter === option.value
        const count = statusCounts[option.value]

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatusFilter(option.value)}
            aria-pressed={isActive}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
            ].join(' ')}
          >
            {option.label}
            <span
              className={[
                'rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                isActive ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 dark:bg-slate-700 dark:text-slate-300',
              ].join(' ')}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
