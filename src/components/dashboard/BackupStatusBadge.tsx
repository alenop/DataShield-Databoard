import { useTranslation } from 'react-i18next'
import type { BackupStatus } from '../../types/backup.types'

interface BackupStatusBadgeProps {
  status: BackupStatus
}

const statusStyles: Record<BackupStatus, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  failure: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

export function BackupStatusBadge({ status }: BackupStatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {status === 'in_progress' && (
        <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
      )}
      {t(`status.backup.${status}`)}
    </span>
  )
}
