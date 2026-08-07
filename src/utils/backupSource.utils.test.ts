import {
  createBackupSource,
  generateSourceId,
  isValidHttpsApiEndpoint,
  normalizeBackupSource,
  parseStoredBackupSources,
  updateBackupSource,
  validateBackupSourceInput,
} from './backupSource.utils'

describe('isValidHttpsApiEndpoint', () => {
  it('accepts valid https URLs', () => {
    expect(isValidHttpsApiEndpoint('https://example.com')).toBe(true)
    expect(
      isValidHttpsApiEndpoint('https://org-prod.my.salesforce.com/services/data/v58.0'),
    ).toBe(true)
  })

  it('rejects non-https URLs', () => {
    expect(isValidHttpsApiEndpoint('http://example.com')).toBe(false)
    expect(isValidHttpsApiEndpoint('not-a-url')).toBe(false)
  })
})

describe('validateBackupSourceInput', () => {
  it('returns null for valid input', () => {
    expect(
      validateBackupSourceInput({
        name: 'Salesforce Production Core',
        environment: 'Production',
        apiEndpoint: 'https://org-prod.my.salesforce.com/services/data/v58.0',
      }),
    ).toBeNull()
  })

  it('returns error for empty name', () => {
    expect(
      validateBackupSourceInput({
        name: '',
        environment: 'Production',
        apiEndpoint: 'https://example.com',
      }),
    ).toBe('Le nom est requis.')
  })

  it('returns error for empty environment', () => {
    expect(
      validateBackupSourceInput({
        name: 'Prod',
        environment: '',
        apiEndpoint: 'https://example.com',
      }),
    ).toBe("L'environnement est requis.")
  })

  it('returns error for invalid apiEndpoint', () => {
    expect(
      validateBackupSourceInput({
        name: 'Prod',
        environment: 'Production',
        apiEndpoint: 'http://example.com',
      }),
    ).toContain('HTTPS')
  })
})

describe('generateSourceId', () => {
  it('generates a uuid-like string', () => {
    const id = generateSourceId()
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })
})

describe('createBackupSource', () => {
  it('creates source with trimmed values, generated uuid and CONNECTED status', () => {
    const source = createBackupSource({
      name: '  Salesforce Production Core  ',
      environment: '  Production  ',
      apiEndpoint: '  https://org-prod.my.salesforce.com/services/data/v58.0  ',
    })
    expect(source.name).toBe('Salesforce Production Core')
    expect(source.environment).toBe('Production')
    expect(source.apiEndpoint).toBe('https://org-prod.my.salesforce.com/services/data/v58.0')
    expect(source.status).toBe('CONNECTED')
    expect(source.id).toMatch(/^[0-9a-f-]{36}$/i)
  })
})

describe('updateBackupSource', () => {
  it('updates editable fields and preserves status', () => {
    const updated = updateBackupSource(
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Old',
        environment: 'Staging',
        apiEndpoint: 'https://old.com',
        status: 'CONNECTED',
      },
      {
        name: 'New',
        environment: 'Production',
        apiEndpoint: 'https://new.com',
      },
    )
    expect(updated.status).toBe('CONNECTED')
    expect(updated.name).toBe('New')
  })
})

describe('normalizeBackupSource', () => {
  it('migrates legacy address field to apiEndpoint', () => {
    const source = normalizeBackupSource({
      id: 'src-001',
      name: 'Salesforce Production',
      address: 'https://prod.salesforce.com',
    })
    expect(source).toEqual({
      id: 'src-001',
      name: 'Salesforce Production',
      environment: 'Production',
      apiEndpoint: 'https://prod.salesforce.com',
      status: 'CONNECTED',
    })
  })

  it('returns null when required fields are missing', () => {
    expect(normalizeBackupSource({ name: 'Test' })).toBeNull()
  })
})

describe('parseStoredBackupSources', () => {
  const fallback = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Default',
      environment: 'Production',
      apiEndpoint: 'https://default.example.com',
      status: 'CONNECTED' as const,
    },
  ]

  it('returns fallback when storage is empty', () => {
    expect(parseStoredBackupSources(null, fallback)).toEqual(fallback)
  })

  it('parses valid stored sources', () => {
    const stored = JSON.stringify([
      {
        id: 'b14eebc9-9c0b-41f8-bb6d-6bb9bd380b22',
        name: 'Stored',
        environment: 'Staging',
        apiEndpoint: 'https://stored.example.com',
        status: 'CONNECTED',
      },
    ])
    expect(parseStoredBackupSources(stored, fallback)[0].apiEndpoint).toBe(
      'https://stored.example.com',
    )
  })

  it('returns fallback when stored data is invalid', () => {
    expect(parseStoredBackupSources('not-json', fallback)).toEqual(fallback)
    expect(parseStoredBackupSources(JSON.stringify([{ name: 'Incomplete' }]), fallback)).toEqual(
      fallback,
    )
  })
})
