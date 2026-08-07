import { BackupActions } from './BackupActions'
import { BackupDetailPanel } from './BackupDetailPanel'
import { StopBackupConfirmModal } from '../ui/StopBackupConfirmModal'
import { currentUser } from '../../data/currentUser'
import { mockBackupRecords, mockBackupVolume } from '../../data/mockBackups'
import type { AppSettingsState } from '../../hooks/useAppSettings'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import { useBackupRecords } from '../../hooks/useBackupRecords'
import { useConfirmModal } from '../../hooks/useConfirmModal'
import { useStopBackupConfirm } from '../../hooks/useStopBackupConfirm'
import { BackupDataTable } from './BackupDataTable'
import { BackupSearchBar } from './BackupSearchBar'
import { BackupStatusFilterBar } from './BackupStatusFilterBar'
import { BackupVolumeChart } from './BackupVolumeChart'

interface DashboardPageProps {
  appSettings: AppSettingsState
  backupSources: BackupSourcesState
}

export function DashboardPage({ appSettings, backupSources }: DashboardPageProps) {
  const backupRecords = useBackupRecords({
    initialRecords: mockBackupRecords,
    username: currentUser.name,
  })
  const confirmModal = useConfirmModal()
  const stopConfirm = useStopBackupConfirm({
    onConfirmStop: backupRecords.stopBackup,
    requireConfirmation: appSettings.settings.confirmStopBackup,
  })

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
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Vue d&apos;ensemble des sauvegardes — données fictives de démonstration
          </p>
        </div>
        <BackupActions
          confirmModal={confirmModal}
          backupSources={backupSources}
          onLaunchBackup={handleLaunchBackup}
        />
      </div>

      {backupRecords.notification && (
        <div
          role="status"
          className={[
            'rounded-lg border px-4 py-3 text-sm',
            backupRecords.notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
          ].join(' ')}
        >
          {backupRecords.notification.message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Volume de données sauvegardées
        </h2>
        <div className="mt-4">
          <BackupVolumeChart data={mockBackupVolume} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Sauvegardes récentes
            </h2>
            <BackupSearchBar
              query={backupRecords.sourceQuery}
              onQueryChange={backupRecords.setSourceQuery}
            />
          </div>
          <BackupStatusFilterBar filters={backupRecords} />
        </div>
        <div className="mt-4">
          <BackupDataTable
            records={backupRecords.filteredRecords}
            selectedId={backupRecords.selectedId}
            getProgressPercent={backupRecords.getBackupProgressPercent}
            onSelect={backupRecords.selectBackup}
            onRetry={backupRecords.retryBackup}
            onStop={handleStopRequest}
          />
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
          onClose={backupRecords.clearSelection}
        />
      )}
    </div>
  )
}
