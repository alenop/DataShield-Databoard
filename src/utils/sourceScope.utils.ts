import type { TFunction } from 'i18next'
import {
  DEFAULT_SOURCE_SCOPES,
  SOURCE_SCOPES,
  type SourceScope,
} from '../types/sourceScope.types'

const LEGACY_SCOPE_MAP: Record<string, SourceScope> = {
  full: 'full',
  'données complètes': 'full',
  'donnees completes': 'full',
  contacts: 'contacts',
  comptes: 'accounts',
  accounts: 'accounts',
  leads: 'leads',
  opportunités: 'opportunities',
  opportunites: 'opportunities',
  opportunities: 'opportunities',
  'métriques agrégées': 'aggregatedMetrics',
  'metriques agregees': 'aggregatedMetrics',
  'aggregated metrics': 'aggregatedMetrics',
  aggregatedmetrics: 'aggregatedMetrics',
  'logs api': 'apiLogs',
  apilogs: 'apiLogs',
}

export function isSourceScope(value: string): value is SourceScope {
  return (SOURCE_SCOPES as readonly string[]).includes(value)
}

export function resolveScopeKey(value: string): SourceScope | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (isSourceScope(trimmed)) return trimmed

  return LEGACY_SCOPE_MAP[trimmed.toLowerCase()] ?? null
}

export function normalizeScopes(scopes: unknown): SourceScope[] {
  if (!Array.isArray(scopes)) return [...DEFAULT_SOURCE_SCOPES]

  const seen = new Set<SourceScope>()
  const normalized: SourceScope[] = []

  for (const scope of scopes) {
    if (typeof scope !== 'string') continue

    const key = resolveScopeKey(scope)
    if (!key || seen.has(key)) continue

    seen.add(key)
    normalized.push(key)
  }

  return normalized.length > 0 ? normalized : [...DEFAULT_SOURCE_SCOPES]
}

export function normalizeScope(value: unknown): SourceScope {
  if (typeof value === 'string') {
    const key = resolveScopeKey(value)
    if (key) return key
  }

  return DEFAULT_SOURCE_SCOPES[0]
}

export function getScopeLabel(scope: SourceScope, t: TFunction): string {
  return t(`scopes.${scope}`)
}

export function getScopeLabelFromValue(value: string, t: TFunction): string {
  const key = resolveScopeKey(value)
  return key ? getScopeLabel(key, t) : value
}
