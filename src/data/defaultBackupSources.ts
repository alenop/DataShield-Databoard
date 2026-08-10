import type { BackupSource } from '../types/backupSource.types'
import { DEFAULT_SOURCE_STATUS } from '../types/backupSource.types'

export const defaultBackupSources: BackupSource[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Salesforce Production Core',
    environment: 'Production',
    apiEndpoint: 'https://org-prod.my.salesforce.com/services/data/v58.0',
    status: DEFAULT_SOURCE_STATUS,
    scopes: ['contacts', 'opportunities', 'accounts', 'leads'],
  },
  {
    id: 'b14eebc9-9c0b-41f8-bb6d-6bb9bd380b22',
    name: 'Salesforce Staging Sandbox',
    environment: 'Staging',
    apiEndpoint: 'https://org-staging.my.salesforce.com/services/data/v58.0',
    status: DEFAULT_SOURCE_STATUS,
    scopes: ['contacts', 'opportunities'],
  },
  {
    id: 'c24eebc9-9c0b-42f8-bb6d-6bb9bd380c33',
    name: 'External Metrics API',
    environment: 'Production',
    apiEndpoint: 'https://api.datashield.test/v1',
    status: DEFAULT_SOURCE_STATUS,
    scopes: ['aggregatedMetrics', 'apiLogs'],
  },
]
