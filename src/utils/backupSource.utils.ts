import i18n from '../i18n'
import type { BackupSource, BackupSourceInput, BackupSourceStatus } from '../types/backupSource.types'
import { DEFAULT_SOURCE_STATUS } from '../types/backupSource.types'
import { normalizeScopes, resolveScopeKey } from './sourceScope.utils'

export { normalizeScopes } from './sourceScope.utils'

interface LegacyBackupSourceRecord {
  id?: string
  name?: string
  address?: string
  environment?: string
  apiEndpoint?: string
  status?: string
  scopes?: unknown
}

const VALID_STATUSES: BackupSourceStatus[] = ['CONNECTED', 'DISCONNECTED', 'ERROR']

function isBackupSourceStatus(value: string): value is BackupSourceStatus {
  return VALID_STATUSES.includes(value as BackupSourceStatus)
}

export function normalizeBackupSource(raw: unknown): BackupSource | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as LegacyBackupSourceRecord
  const name = record.name?.trim()
  const apiEndpoint = (record.apiEndpoint ?? record.address)?.trim()

  if (!name || !apiEndpoint) return null

  return {
    id: record.id?.trim() || generateSourceId(),
    name,
    environment: record.environment?.trim() || 'Production',
    apiEndpoint,
    status: record.status && isBackupSourceStatus(record.status)
      ? record.status
      : DEFAULT_SOURCE_STATUS,
    scopes: normalizeScopes(record.scopes),
  }
}

export function parseStoredBackupSources(
  stored: string | null,
  fallback: BackupSource[],
): BackupSource[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map(normalizeBackupSource)
      .filter((source): source is BackupSource => source !== null)

    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

export function isValidHttpsApiEndpoint(apiEndpoint: string): boolean {
  try {
    const url = new URL(apiEndpoint.trim())
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

export function hasValidScopes(scopes: unknown): boolean {
  if (!Array.isArray(scopes) || scopes.length === 0) return false
  return scopes.some((scope) => typeof scope === 'string' && resolveScopeKey(scope) !== null)
}

export function validateBackupSourceInput(input: BackupSourceInput): string | null {
  if (!input.name.trim()) return i18n.t('validation.nameRequired')
  if (!input.environment.trim()) return i18n.t('validation.environmentRequired')
  if (!input.apiEndpoint.trim()) return i18n.t('validation.apiEndpointRequired')
  if (!isValidHttpsApiEndpoint(input.apiEndpoint)) {
    return i18n.t('validation.apiEndpointHttps')
  }
  if (!hasValidScopes(input.scopes)) {
    return i18n.t('validation.scopeRequired')
  }
  return null
}

/**
 * Génère un UUID pour l'identifiant d'une source de sauvegarde.
 *
 * Dans une application réelle, cette génération doit être déplacée côté backend :
 * le front enverrait les données (nom, environnement, endpoint) à une API POST
 * qui créerait la source et retournerait l'objet complet avec son id UUID.
 *
 * Ici on simule ce comportement côté client uniquement pour la démo.
 */
export function generateSourceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function createBackupSource(input: BackupSourceInput): BackupSource {
  return {
    // Voir generateSourceId() : en production, l'id est attribué par le backend.
    id: generateSourceId(),
    name: input.name.trim(),
    environment: input.environment.trim(),
    apiEndpoint: input.apiEndpoint.trim(),
    status: DEFAULT_SOURCE_STATUS,
    scopes: normalizeScopes(input.scopes),
  }
}

export function updateBackupSource(
  source: BackupSource,
  input: BackupSourceInput,
): BackupSource {
  return {
    ...source,
    name: input.name.trim(),
    environment: input.environment.trim(),
    apiEndpoint: input.apiEndpoint.trim(),
    scopes: normalizeScopes(input.scopes),
  }
}
