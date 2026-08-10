import { useTranslation } from 'react-i18next'

interface BackupPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
}

export function BackupPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
}: BackupPaginationProps) {
  const { t } = useTranslation()

  if (totalItems === 0) return null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t('common.paginationRange', { start: startIndex + 1, end: endIndex, total: totalItems, count: totalItems })}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {t('common.previous')}
        </button>

        <span className="px-2 text-sm tabular-nums text-slate-600 dark:text-slate-400">
          {t('common.pageOf', { current: currentPage, total: totalPages })}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}
