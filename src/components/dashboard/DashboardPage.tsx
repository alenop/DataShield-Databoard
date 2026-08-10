import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BackupActions } from './BackupActions'
import { BackupDetailPanel } from './BackupDetailPanel'
import { StopBackupConfirmModal } from '../ui/StopBackupConfirmModal'
import type { AppSettingsState } from '../../hooks/useAppSettings'
import type { BackupRecordsState } from '../../hooks/useBackupRecords'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import type { RestoreJobsState } from '../../hooks/useRestoreJobs'
import type { RestoreBackupOption } from '../../types/restoreJob.types'
import { useStopBackupConfirm } from '../../hooks/useStopBackupConfirm'
import { buildBackupVolumeFromRecords } from '../../utils/backupVolume.utils'
import { BackupDataTable } from './BackupDataTable'
import { BackupVolumeChart } from './BackupVolumeChart'

const DASHBOARD_PREVIEW_SIZE = 3

interface DashboardPageProps {
  appSettings: AppSettingsState
  backupSources: BackupSourcesState
  backupRecords: BackupRecordsState
  restoreJobs: RestoreJobsState
  availableRestoreBackups: RestoreBackupOption[]
}

export function DashboardPage({
  appSettings,
  backupSources,
  backupRecords,
  restoreJobs,
  availableRestoreBackups,
}: DashboardPageProps) {
  const { t } = useTranslation()

  const stopConfirm = useStopBackupConfirm({
    onConfirmStop: backupRecords.stopBackup,
    requireConfirmation: appSettings.settings.confirmStopBackup,
  })

  const recentBackups = useMemo(
    () => backupRecords.records.slice(0, DASHBOARD_PREVIEW_SIZE),
    [backupRecords.records],
  )

  const backupVolume = useMemo(
    () => buildBackupVolumeFromRecords(backupRecords.records),
    [backupRecords.records],
  )

  const handleStopRequest = (id: string) => {
    const backup = backupRecords.records.find((record) => record.id === id)
    if (!backup) return
    stopConfirm.requestStop(id, backup.name)
  }

  const handleLaunchBackup = (name: string, sourceId: string) => {
    const source = backupSources.getSourceById(sourceId)
    if (!source) return
    backupRecords.launchBackup({ name, source })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('pages.dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.dashboard.subtitle')}
          </p>
        </div>
        <BackupActions
          backupSources={backupSources}
          restoreJobs={restoreJobs}
          availableRestoreBackups={availableRestoreBackups}
          onLaunchBackup={handleLaunchBackup}
        />
      </div>

      {(backupRecords.notification ?? restoreJobs.notification) && (
        <div
          role="status"
          className={[
            'rounded-lg border px-4 py-3 text-sm',
            (backupRecords.notification ?? restoreJobs.notification)?.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
          ].join(' ')}
        >
          {(backupRecords.notification ?? restoreJobs.notification)?.message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('pages.dashboard.recentBackups')}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.dashboard.recentBackupsHint', { count: DASHBOARD_PREVIEW_SIZE })}
        </p>
        <div className="mt-4">
          <BackupDataTable
            records={recentBackups}
            sources={backupSources.sources}
            selectedId={backupRecords.selectedId}
            getProgressPercent={backupRecords.getBackupProgressPercent}
            onSelect={backupRecords.selectBackup}
            onRetry={backupRecords.retryBackup}
            onStop={handleStopRequest}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('pages.dashboard.backupVolume')}
        </h2>
        <div className="mt-4">
          <BackupVolumeChart data={backupVolume} />
        </div>
      </section>

      <StopBackupConfirmModal
        isOpen={stopConfirm.isOpen}
        backupName={stopConfirm.backupName}
        onClose={stopConfirm.cancelStop}
        onConfirm={stopConfirm.confirmStop}
      />

      {backupRecords.selectedBackup && (
        <BackupDetailPanel
          backup={backupRecords.selectedBackup}
          sources={backupSources.sources}
          onClose={backupRecords.clearSelection}
        />
      )}
    </div>
  )
}
