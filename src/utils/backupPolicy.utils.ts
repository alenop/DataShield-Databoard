import type { BackupPolicy, CreateBackupPolicyInput } from '../types/backupPolicy.types'
import {
  POLICY_FREQUENCY_PRESETS,
  POLICY_RETENTION_PRESETS,
} from '../types/backupPolicy.types'

export function formatRetentionLabel(days: number): string {
  const preset = POLICY_RETENTION_PRESETS.find((item) => item.days === days)
  if (preset) return preset.label
  return `Conserver ${days} jours`
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
  if (!name) return 'Le nom de la politique est requis.'
  if (name.length < 3) return 'Le nom doit contenir au moins 3 caractères.'

  if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    return 'Une politique avec ce nom existe déjà.'
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
  if (!name) return 'Le nom de la politique est requis.'
  if (name.length < 3) return 'Le nom doit contenir au moins 3 caractères.'

  const duplicate = policies.some(
    (policy) =>
      policy.id !== policyId && policy.name.toLowerCase() === name.toLowerCase(),
  )
  if (duplicate) return 'Une politique avec ce nom existe déjà.'

  return validatePolicyFields(input, availableSourceIds)
}

function validatePolicyFields(
  input: CreateBackupPolicyInput,
  availableSourceIds: string[],
): string | null {
  if (!getFrequencyPreset(input.frequencyPresetId)) {
    return 'Fréquence invalide.'
  }

  if (input.retentionDays <= 0) return 'La rétention doit être supérieure à 0 jours.'

  if (input.sourceIds.length === 0) {
    return 'Sélectionnez au moins une source.'
  }

  const invalidSource = input.sourceIds.some((id) => !availableSourceIds.includes(id))
  if (invalidSource) return 'Une ou plusieurs sources sélectionnées sont invalides.'

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
    frequencyLabel: preset?.label ?? policy.frequencyLabel,
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
    frequencyLabel: preset?.label ?? 'Tous les jours à 02:00',
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
