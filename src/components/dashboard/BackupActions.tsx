import { useState } from 'react'
import { HardDriveDownload, RotateCcw } from 'lucide-react'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import type { useConfirmModal } from '../../hooks/useConfirmModal'
import { ConfirmModal } from '../ui/ConfirmModal'
import { LaunchBackupModal } from './LaunchBackupModal'

interface BackupActionsProps {
  confirmModal: ReturnType<typeof useConfirmModal>
  backupSources: BackupSourcesState
  onLaunchBackup: (name: string, sourceId: string) => void
}

export function BackupActions({
  confirmModal,
  backupSources,
  onLaunchBackup,
}: BackupActionsProps) {
  const { isOpen, action, feedback, openModal, closeModal, confirm } = confirmModal
  const [isLaunchOpen, setIsLaunchOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsLaunchOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <HardDriveDownload className="h-4 w-4" aria-hidden="true" />
          Lancer une sauvegarde
        </button>

        <button
          type="button"
          onClick={() => openModal('restore')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Restaurer
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        >
          {feedback}
        </div>
      )}

      <LaunchBackupModal
        isOpen={isLaunchOpen}
        sources={backupSources.sources}
        onClose={() => setIsLaunchOpen(false)}
        onLaunch={onLaunchBackup}
      />

      <ConfirmModal
        isOpen={isOpen}
        action={action}
        onClose={closeModal}
        onConfirm={confirm}
      />
    </>
  )
}
