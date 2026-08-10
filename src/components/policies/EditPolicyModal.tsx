import { useEffect, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BackupSource } from '../../types/backupSource.types'
import type { BackupPolicy, CreateBackupPolicyInput } from '../../types/backupPolicy.types'
import {
  POLICY_FREQUENCY_PRESETS,
  POLICY_RETENTION_PRESETS,
} from '../../types/backupPolicy.types'
import { getFrequencyPresetIdByCron } from '../../utils/backupPolicy.utils'

interface EditPolicyModalProps {
  isOpen: boolean
  policy: BackupPolicy | null
  sources: BackupSource[]
  onClose: () => void
  onSave: (policyId: string, input: CreateBackupPolicyInput) => string | null
}

export function EditPolicyModal({
  isOpen,
  policy,
  sources,
  onClose,
  onSave,
}: EditPolicyModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [frequencyPresetId, setFrequencyPresetId] = useState(POLICY_FREQUENCY_PRESETS[0].id)
  const [retentionDays, setRetentionDays] = useState<number>(POLICY_RETENTION_PRESETS[1].days)
  const [sourceIds, setSourceIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen || !policy) return

    setName(policy.name)
    setFrequencyPresetId(getFrequencyPresetIdByCron(policy.cronExpression))
    setRetentionDays(policy.retentionDays)
    setSourceIds(policy.sourceIds)
    setError(null)
    nameInputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, policy, onClose])

  if (!isOpen || !policy) return null

  const toggleSource = (sourceId: string) => {
    setSourceIds((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId],
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const validationError = onSave(policy.id, {
      name,
      frequencyPresetId,
      retentionDays,
      sourceIds,
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
      aria-labelledby="edit-policy-modal-title"
    >
      <button
        type="button"
        aria-label={t('common.closeModal')}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
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
          id="edit-policy-modal-title"
          className="pr-8 text-lg font-semibold text-slate-900 dark:text-white"
        >
          {t('pages.policies.editModal.title')}
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="edit-policy-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.policyName')}
            </label>
            <input
              ref={nameInputRef}
              id="edit-policy-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="edit-policy-frequency"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.frequencyCron')}
            </label>
            <select
              id="edit-policy-frequency"
              value={frequencyPresetId}
              onChange={(event) => setFrequencyPresetId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {POLICY_FREQUENCY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {t(`pages.policies.frequencyPresets.${preset.id}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-policy-retention"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('common.retention')}
            </label>
            <select
              id="edit-policy-retention"
              value={retentionDays}
              onChange={(event) => setRetentionDays(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {POLICY_RETENTION_PRESETS.map((preset) => (
                <option key={preset.days} value={preset.days}>
                  {t(`pages.policies.retentionPresets.${preset.days}`)}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('common.associatedSources')}
            </legend>
            <div className="mt-2 space-y-2">
              {sources.map((source) => (
                <label
                  key={source.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                >
                  <input
                    type="checkbox"
                    checked={sourceIds.includes(source.id)}
                    onChange={() => toggleSource(source.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {source.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
