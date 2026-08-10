import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, HardDriveDownload, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BackupRecordsState } from '../../hooks/useBackupRecords'
import type { BackupSchedulesState } from '../../hooks/useBackupSchedules'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import type { AppSettingsState } from '../../hooks/useAppSettings'
import { useStopBackupConfirm } from '../../hooks/useStopBackupConfirm'
import { paginateItems } from '../../utils/pagination.utils'
import {
  formatNextRunDate,
  formatScheduleDescription,
} from '../../utils/backupSchedule.utils'
import { BackupDataTable } from '../dashboard/BackupDataTable'
import { BackupDetailPanel } from '../dashboard/BackupDetailPanel'
import { BackupSearchBar } from '../dashboard/BackupSearchBar'
import { BackupStatusFilterBar } from '../dashboard/BackupStatusFilterBar'
import { LaunchBackupModal } from '../dashboard/LaunchBackupModal'
import { StopBackupConfirmModal } from '../ui/StopBackupConfirmModal'
import { BackupPagination } from './BackupPagination'
import { ScheduleBackupModal } from './ScheduleBackupModal'

const BACKUPS_PAGE_SIZE = 5

interface BackupsPageProps {
  appSettings: AppSettingsState
  backupSources: BackupSourcesState
  backupRecords: BackupRecordsState
  backupSchedules: BackupSchedulesState
}

export function BackupsPage({
  appSettings,
  backupSources,
  backupRecords,
  backupSchedules,
}: BackupsPageProps) {
  const { t } = useTranslation()
  const { sources } = backupSources
  const { schedules, notification: scheduleNotification, createSchedule, toggleScheduleActive, deleteSchedule } =
    backupSchedules
  const [page, setPage] = useState(1)
  const [isLaunchOpen, setIsLaunchOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const stopConfirm = useStopBackupConfirm({
    onConfirmStop: backupRecords.stopBackup,
    requireConfirmation: appSettings.settings.confirmStopBackup,
  })

  const pagination = useMemo(
    () => paginateItems(backupRecords.filteredRecords, page, BACKUPS_PAGE_SIZE),
    [backupRecords.filteredRecords, page],
  )

  useEffect(() => {
    setPage(1)
  }, [backupRecords.statusFilter, backupRecords.sourceQuery])

  useEffect(() => {
    if (page > pagination.totalPages) {
      setPage(pagination.totalPages)
    }
  }, [page, pagination.totalPages])

  const handleStopRequest = (id: string) => {
    const backup = backupRecords.records.find((record) => record.id === id)
    if (!backup) return
    stopConfirm.requestStop(id, backup.name)
  }

  const handleLaunchBackup = (name: string, sourceId: string) => {
    const source = backupSources.getSourceById(sourceId)
    if (!source) return
    backupRecords.launchBackup({ name, source })
    setPage(1)
  }

  const getSourceName = (sourceId: string) =>
    sources.find((source) => source.id === sourceId)?.name ?? t('common.emptyDash')

  const activeNotification = backupRecords.notification ?? scheduleNotification

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pages.backups.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.backups.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            {t('pages.backups.scheduleBackup')}
          </button>
          <button
            type="button"
            onClick={() => setIsLaunchOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <HardDriveDownload className="h-4 w-4" aria-hidden="true" />
            {t('pages.backups.launchBackup')}
          </button>
        </div>
      </div>

      {activeNotification && (
        <div
          role="status"
          className={[
            'rounded-lg border px-4 py-3 text-sm',
            activeNotification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
          ].join(' ')}
        >
          {activeNotification.message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          {t('common.countWithLabel', { label: t('pages.backups.schedules'), count: schedules.length })}
        </h2>

        {schedules.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.backups.noSchedules')}
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
                    {t('common.source')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.frequency')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.nextRun')}
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
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {schedule.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {getSourceName(schedule.sourceId)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatScheduleDescription(schedule)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatNextRunDate(schedule)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleScheduleActive(schedule.id)}
                        className={[
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                          schedule.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400',
                        ].join(' ')}
                      >
                        {t(`status.schedule.${schedule.isActive ? 'active' : 'inactive'}`)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteSchedule(schedule.id)}
                        aria-label={t('common.deleteAria', { name: schedule.name })}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {t('pages.backups.allBackups')}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t('common.matchingBackups', { count: backupRecords.filteredRecords.length })}
              </p>
            </div>
            <BackupSearchBar
              query={backupRecords.sourceQuery}
              onQueryChange={backupRecords.setSourceQuery}
            />
          </div>
          <BackupStatusFilterBar filters={backupRecords} />
        </div>

        <div className="mt-4 space-y-4">
          <BackupDataTable
            records={pagination.items}
            sources={sources}
            selectedId={backupRecords.selectedId}
            getProgressPercent={backupRecords.getBackupProgressPercent}
            onSelect={backupRecords.selectBackup}
            onRetry={backupRecords.retryBackup}
            onStop={handleStopRequest}
          />
          <BackupPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={setPage}
          />
        </div>
      </section>

      <LaunchBackupModal
        isOpen={isLaunchOpen}
        sources={sources}
        onClose={() => setIsLaunchOpen(false)}
        onLaunch={handleLaunchBackup}
      />

      <ScheduleBackupModal
        isOpen={isScheduleOpen}
        sources={sources}
        onClose={() => setIsScheduleOpen(false)}
        onCreate={createSchedule}
      />

      <StopBackupConfirmModal
        isOpen={stopConfirm.isOpen}
        backupName={stopConfirm.backupName}
        onClose={stopConfirm.cancelStop}
        onConfirm={stopConfirm.confirmStop}
      />

      {backupRecords.selectedBackup && (
        <BackupDetailPanel
          backup={backupRecords.selectedBackup}
          sources={sources}
          onClose={backupRecords.clearSelection}
        />
      )}
    </div>
  )
}
