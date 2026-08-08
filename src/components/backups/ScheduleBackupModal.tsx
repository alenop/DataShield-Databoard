import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { BackupSource } from '../../types/backupSource.types'
import type {
  BackupScheduleFrequency,
  CreateBackupScheduleInput,
} from '../../types/backupSchedule.types'
import {
  BACKUP_SCHEDULE_FREQUENCY_LABELS,
  BACKUP_SCHEDULE_WEEKDAYS,
  DEFAULT_SCHEDULE_TIME,
} from '../../types/backupSchedule.types'

interface ScheduleBackupModalProps {
  isOpen: boolean
  sources: BackupSource[]
  onClose: () => void
  onCreate: (input: CreateBackupScheduleInput) => string | null
}

export function ScheduleBackupModal({
  isOpen,
  sources,
  onClose,
  onCreate,
}: ScheduleBackupModalProps) {
  const [name, setName] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [frequency, setFrequency] = useState<BackupScheduleFrequency>('daily')
  const [time, setTime] = useState(DEFAULT_SCHEDULE_TIME)
  const [weekday, setWeekday] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    setName('Sauvegarde planifiée')
    setSourceId(sources[0]?.id ?? '')
    setFrequency('daily')
    setTime(DEFAULT_SCHEDULE_TIME)
    setWeekday(0)
    setError(null)
    nameInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, sources, onClose])

  if (!isOpen) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = onCreate({
      name,
      sourceId,
      frequency,
      time,
      weekday: frequency === 'weekly' ? weekday : null,
    })
    if (validationError) {
      setError(validationError)
      return
    }

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-backup-modal-title"
    >
      <button
        type="button"
        aria-label="Fermer la modale"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="schedule-backup-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          Planifier une sauvegarde
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Configurez une exécution automatique quotidienne ou hebdomadaire.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="schedule-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nom de la planification
            </label>
            <input
              ref={nameInputRef}
              id="schedule-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Sauvegarde quotidienne CRM"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="schedule-source"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Source
            </label>
            <select
              id="schedule-source"
              value={sourceId}
              onChange={(event) => setSourceId(event.target.value)}
              disabled={sources.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="schedule-frequency"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Fréquence
            </label>
            <select
              id="schedule-frequency"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as BackupScheduleFrequency)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {Object.entries(BACKUP_SCHEDULE_FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label
                htmlFor="schedule-weekday"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Jour de la semaine
              </label>
              <select
                id="schedule-weekday"
                value={weekday}
                onChange={(event) => setWeekday(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {BACKUP_SCHEDULE_WEEKDAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="schedule-time"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Heure d&apos;exécution
            </label>
            <input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={sources.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Planifier
          </button>
        </div>
      </form>
    </div>
  )
}
