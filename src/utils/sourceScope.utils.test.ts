import {
  normalizeScope,
  normalizeScopes,
  resolveScopeKey,
} from './sourceScope.utils'

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
