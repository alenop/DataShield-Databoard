import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BackupSource } from '../../types/backupSource.types'
import type {
  BackupScheduleFrequency,
  CreateBackupScheduleInput,
} from '../../types/backupSchedule.types'
import { DEFAULT_SCHEDULE_TIME } from '../../types/backupSchedule.types'

interface ScheduleBackupModalProps {
  isOpen: boolean
  sources: BackupSource[]
  onClose: () => void
  onCreate: (input: CreateBackupScheduleInput) => string | null
}

const FREQUENCY_VALUES: BackupScheduleFrequency[] = ['daily', 'weekly']
const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const

export function ScheduleBackupModal({
  isOpen,
  sources,
  onClose,
  onCreate,
}: ScheduleBackupModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [frequency, setFrequency] = useState<BackupScheduleFrequency>('daily')
  const [time, setTime] = useState(DEFAULT_SCHEDULE_TIME)
  const [weekday, setWeekday] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    setName(t('pages.backups.scheduleModal.defaultName'))
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
  }, [isOpen, sources, onClose, t])

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
        aria-label={t('common.closeModal')}
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
          aria-label={t('common.close')}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="schedule-backup-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          {t('pages.backups.scheduleModal.title')}
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.backups.scheduleModal.description')}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="schedule-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('pages.backups.scheduleModal.scheduleNameLabel')}
            </label>
            <input
              ref={nameInputRef}
              id="schedule-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('pages.backups.scheduleModal.scheduleNamePlaceholder')}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="schedule-source"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.source')}
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
              {t('common.frequency')}
            </label>
            <select
              id="schedule-frequency"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as BackupScheduleFrequency)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {FREQUENCY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(`schedule.frequency.${value}`)}
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
                {t('common.weekday')}
              </label>
              <select
                id="schedule-weekday"
                value={weekday}
                onChange={(event) => setWeekday(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {WEEKDAY_VALUES.map((day) => (
                  <option key={day} value={day}>
                    {t(`schedule.weekdays.${day}`)}
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
              {t('common.executionTime')}
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
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={sources.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('common.schedule')}
          </button>
        </div>
      </form>
    </div>
  )
}
