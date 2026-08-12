import {
  getBackupScopeOptions,
  isValidBackupScopesForSource,
  normalizeScope,
  normalizeScopes,
  resolveScopeKey,
} from './sourceScope.utils'
import { defaultBackupSources } from '../data/defaultBackupSources'
import type { SourceScope } from '../types/sourceScope.types'

describe('resolveScopeKey', () => {
  it('resolves canonical scope keys', () => {
    expect(resolveScopeKey('contacts')).toBe('contacts')
    expect(resolveScopeKey('aggregatedMetrics')).toBe('aggregatedMetrics')
  })

  it('migrates legacy French labels', () => {
    expect(resolveScopeKey('Contacts')).toBe('contacts')
    expect(resolveScopeKey('Opportunités')).toBe('opportunities')
    expect(resolveScopeKey('Données complètes')).toBe('full')
    expect(resolveScopeKey('Métriques agrégées')).toBe('aggregatedMetrics')
    expect(resolveScopeKey('Logs API')).toBe('apiLogs')
  })
})

describe('normalizeScopes', () => {
  it('deduplicates and migrates legacy values', () => {
    expect(normalizeScopes([' Contacts ', 'contacts', '', 'Leads'])).toEqual([
      'contacts',
      'leads',
    ])
  })

  it('falls back to default scope when empty', () => {
    expect(normalizeScopes([])).toEqual(['full'])
  })
})

describe('normalizeScope', () => {
  it('returns default for unknown values', () => {
    expect(normalizeScope('unknown')).toBe('full')
  })

  it('migrates legacy labels', () => {
    expect(normalizeScope('Comptes')).toBe('accounts')
  })
})

describe('getBackupScopeOptions', () => {
  it('returns all scopes when source has full data access', () => {
    const source = { ...defaultBackupSources[0], scopes: ['full'] as SourceScope[] }
    expect(getBackupScopeOptions(source)).toContain('contacts')
    expect(getBackupScopeOptions(source)).toContain('full')
  })

  it('returns only configured scopes for partial sources', () => {
    const source = { ...defaultBackupSources[0], scopes: ['contacts'] as SourceScope[] }
    expect(getBackupScopeOptions(source)).toEqual(['contacts'])
  })
})

describe('isValidBackupScopesForSource', () => {
  it('accepts multiple scopes within source limits', () => {
    const source = { ...defaultBackupSources[0], scopes: ['accounts', 'contacts'] as SourceScope[] }
    expect(isValidBackupScopesForSource(source, ['accounts', 'contacts'])).toBe(true)
    expect(isValidBackupScopesForSource(source, ['leads'])).toBe(false)
  })

  it('rejects empty scope selection', () => {
    const source = defaultBackupSources[0]
    expect(isValidBackupScopesForSource(source, [])).toBe(false)
  })
})
