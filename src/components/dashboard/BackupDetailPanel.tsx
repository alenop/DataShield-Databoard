import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { BackupRecord } from '../../types/backup.types'
import type { BackupSource } from '../../types/backupSource.types'
import {
  backupScheduleFrequencyTypeLabels,
  backupStatusLabels,
} from '../../types/backup.types'
import { getBackupSourceLabel } from '../../utils/backupRecord.utils'
import {
  formatBackupDate,
  formatBackupDuration,
  formatBackupDisplayName,
  formatBackupSize,
} from '../../utils/backupFormatters'
import { BackupStatusBadge } from './BackupStatusBadge'

interface BackupDetailPanelProps {
  backup: BackupRecord
  sources: BackupSource[]
  onClose: () => void
}

export function BackupDetailPanel({ backup, sources, onClose }: BackupDetailPanelProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-detail-title"
    >
      <button
        type="button"
        aria-label="Fermer le panneau de détails"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-slate-700">
          <div className="min-w-0 pr-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {backup.id}
            </p>
            <h2
              id="backup-detail-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-white"
            >
              {formatBackupDisplayName(backup.name, backup.scheduleFrequency)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <BackupStatusBadge status={backup.status} />
          </div>

          <dl className="space-y-4 text-sm">
            <DetailRow
              label="Type"
              value={
                backup.scheduleFrequency
                  ? `${backupScheduleFrequencyTypeLabels[backup.scheduleFrequency]} (${backup.scheduleFrequency === 'daily' ? 'j' : 's'})`
                  : 'À la demande'
              }
            />
            <DetailRow label="Source" value={getBackupSourceLabel(backup, sources)} />
            <DetailRow label="Date" value={formatBackupDate(backup.date)} />
            <DetailRow label="Volume" value={formatBackupSize(backup.sizeGb)} />
            <DetailRow label="Durée" value={formatBackupDuration(backup.durationMinutes)} />
            <DetailRow label="Statut" value={backupStatusLabels[backup.status]} />
          </dl>

          {backup.description && (
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {backup.description}
              </p>
            </section>
          )}

          {backup.status === 'failure' && (
            <section className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Détails de l&apos;échec
              </h3>
              {backup.errorReason && (
                <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
                  {backup.errorReason}
                </p>
              )}
              {backup.errorMessage && (
                <pre className="mt-3 overflow-x-auto rounded bg-red-100/80 p-3 font-mono text-xs leading-relaxed text-red-900 dark:bg-red-950 dark:text-red-300">
                  {backup.errorMessage}
                </pre>
              )}
            </section>
          )}

          {backup.status === 'in_progress' && (
            <section className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/50">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Sauvegarde en cours… Les détails seront mis à jour à la fin de l&apos;opération.
              </p>
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}

interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div>
      <dt className="font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-900 dark:text-white">{value}</dd>
    </div>
  )
}
