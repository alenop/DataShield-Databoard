import { BackupActions } from './BackupActions'
import { mockBackupRecords, mockBackupVolume } from '../../data/mockBackups'
import { useBackupFilters } from '../../hooks/useBackupFilters'
import { useConfirmModal } from '../../hooks/useConfirmModal'
import { BackupDataTable } from './BackupDataTable'
import { BackupStatusFilterBar } from './BackupStatusFilterBar'
import { BackupVolumeChart } from './BackupVolumeChart'

export function DashboardPage() {
  const backupFilters = useBackupFilters({ records: mockBackupRecords })
  const confirmModal = useConfirmModal()

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
        <BackupActions confirmModal={confirmModal} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Volume de données sauvegardées
        </h2>
        <div className="mt-4">
          <BackupVolumeChart data={mockBackupVolume} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Sauvegardes récentes
          </h2>
          <BackupStatusFilterBar filters={backupFilters} />
        </div>
        <div className="mt-4">
          <BackupDataTable records={backupFilters.filteredRecords} />
        </div>
      </section>
    </div>
  )
}
