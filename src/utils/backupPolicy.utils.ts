import i18n from '../i18n'
import type { BackupPolicy, CreateBackupPolicyInput } from '../types/backupPolicy.types'
import {
  POLICY_FREQUENCY_PRESETS,
  POLICY_RETENTION_PRESETS,
} from '../types/backupPolicy.types'

export function formatFrequencyLabel(presetId: string): string {
  const preset = getFrequencyPreset(presetId)
  if (!preset) return ''
  return i18n.t(`pages.policies.frequencyPresets.${preset.id}`)
}

export function formatRetentionLabel(days: number): string {
  const preset = POLICY_RETENTION_PRESETS.find((item) => item.days === days)
  if (preset) return i18n.t(`pages.policies.retentionPresets.${preset.days}`)
  return i18n.t('pages.policies.retentionCustom', { days })
}

export function getFrequencyPreset(presetId: string) {
  return POLICY_FREQUENCY_PRESETS.find((preset) => preset.id === presetId)
}

export function getFrequencyPresetIdByCron(cronExpression: string): string {
  const preset = POLICY_FREQUENCY_PRESETS.find(
    (item) => item.cronExpression === cronExpression,
  )
  return preset?.id ?? POLICY_FREQUENCY_PRESETS[0].id
}

export function validateCreatePolicyInput(
  input: CreateBackupPolicyInput,
  existingNames: string[],
  availableSourceIds: string[],
): string | null {
  const name = input.name.trim()
  if (!name) return i18n.t('validation.policyNameRequired')
  if (name.length < 3) return i18n.t('validation.scheduleNameMinLength')

  if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    return i18n.t('validation.policyNameDuplicate')
  }

  return validatePolicyFields(input, availableSourceIds)
}

export function validateUpdatePolicyInput(
  input: CreateBackupPolicyInput,
  policies: BackupPolicy[],
  policyId: string,
  availableSourceIds: string[],
): string | null {
  const name = input.name.trim()
  if (!name) return i18n.t('validation.policyNameRequired')
  if (name.length < 3) return i18n.t('validation.scheduleNameMinLength')

  const duplicate = policies.some(
    (policy) =>
      policy.id !== policyId && policy.name.toLowerCase() === name.toLowerCase(),
  )
  if (duplicate) return i18n.t('validation.policyNameDuplicate')

  return validatePolicyFields(input, availableSourceIds)
}

function validatePolicyFields(
  input: CreateBackupPolicyInput,
  availableSourceIds: string[],
): string | null {
  if (!getFrequencyPreset(input.frequencyPresetId)) {
    return i18n.t('validation.frequencyInvalid')
  }

  if (input.retentionDays <= 0) return i18n.t('validation.retentionInvalid')

  if (input.sourceIds.length === 0) {
    return i18n.t('validation.sourcesRequired')
  }

  const invalidSource = input.sourceIds.some((id) => !availableSourceIds.includes(id))
  if (invalidSource) return i18n.t('validation.sourcesInvalid')

  return null
}

export function applyPolicyInput(
  policy: BackupPolicy,
  input: CreateBackupPolicyInput,
): BackupPolicy {
  const preset = getFrequencyPreset(input.frequencyPresetId)

  return {
    ...policy,
    name: input.name.trim(),
    cronExpression: preset?.cronExpression ?? policy.cronExpression,
    frequencyLabel: preset ? formatFrequencyLabel(preset.id) : policy.frequencyLabel,
    retentionDays: input.retentionDays,
    retentionLabel: formatRetentionLabel(input.retentionDays),
    sourceIds: input.sourceIds,
  }
}

export function createBackupPolicy(input: CreateBackupPolicyInput): BackupPolicy {
  const preset = getFrequencyPreset(input.frequencyPresetId)

  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    cronExpression: preset?.cronExpression ?? '0 2 * * *',
    frequencyLabel: preset
      ? formatFrequencyLabel(preset.id)
      : i18n.t('pages.policies.frequencyPresets.daily-02'),
    retentionDays: input.retentionDays,
    retentionLabel: formatRetentionLabel(input.retentionDays),
    sourceIds: input.sourceIds,
    isActive: true,
  }
}

export function parseStoredBackupPolicies(
  stored: string | null,
  fallback: BackupPolicy[],
): BackupPolicy[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map(normalizePolicy)
      .filter((policy): policy is BackupPolicy => policy !== null)

    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

function normalizePolicy(raw: unknown): BackupPolicy | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<BackupPolicy>
  const name = record.name?.trim()
  const cronExpression = record.cronExpression?.trim()
  const frequencyLabel = record.frequencyLabel?.trim()
  const retentionDays = record.retentionDays
  const sourceIds = record.sourceIds?.filter(Boolean)

  if (!name || !cronExpression || !frequencyLabel || !retentionDays || !sourceIds?.length) {
    return null
  }

  return {
    id: record.id?.trim() || crypto.randomUUID(),
    name,
    cronExpression,
    frequencyLabel,
    retentionDays,
    retentionLabel: record.retentionLabel?.trim() ?? formatRetentionLabel(retentionDays),
    sourceIds,
    isActive: record.isActive !== false,
  }
}
