import { useState } from 'react'
import { HardDriveDownload, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LaunchRestoreModal } from '../imports/LaunchRestoreModal'
import type { RestoreJobsState } from '../../hooks/useRestoreJobs'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import type { RestoreBackupOption } from '../../types/restoreJob.types'
import { LaunchBackupModal } from './LaunchBackupModal'

interface BackupActionsProps {
  backupSources: BackupSourcesState
  restoreJobs: RestoreJobsState
  availableRestoreBackups: RestoreBackupOption[]
  onLaunchBackup: (name: string, sourceId: string) => void
}

export function BackupActions({
  backupSources,
  restoreJobs,
  availableRestoreBackups,
  onLaunchBackup,
}: BackupActionsProps) {
  const { t } = useTranslation()
  const [isLaunchOpen, setIsLaunchOpen] = useState(false)
  const [isRestoreOpen, setIsRestoreOpen] = useState(false)

  const restoreTargets = backupSources.sources.map((source) => ({
    id: source.id,
    name: `${source.name} (${source.environment})`,
  }))

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsLaunchOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <HardDriveDownload className="h-4 w-4" aria-hidden="true" />
          {t('pages.dashboard.launchBackup')}
        </button>

        <button
          type="button"
          onClick={() => setIsRestoreOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t('pages.dashboard.restore')}
        </button>
      </div>

      <LaunchBackupModal
        isOpen={isLaunchOpen}
        sources={backupSources.sources}
        onClose={() => setIsLaunchOpen(false)}
        onLaunch={onLaunchBackup}
      />

      <LaunchRestoreModal
        isOpen={isRestoreOpen}
        backups={availableRestoreBackups}
        targets={restoreTargets}
        onClose={() => setIsRestoreOpen(false)}
        onLaunch={restoreJobs.launchRestore}
      />
    </>
  )
}
