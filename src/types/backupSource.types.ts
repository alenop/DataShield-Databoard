import type { SourceScope } from './sourceScope.types'

export type BackupSourceStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

export interface BackupSource {
  id: string
  name: string
  environment: string
  apiEndpoint: string
  status: BackupSourceStatus
  scopes: SourceScope[]
}

export interface BackupSourceInput {
  name: string
  environment: string
  apiEndpoint: string
  scopes: SourceScope[]
}

export const backupSourceStatusLabels: Record<BackupSourceStatus, string> = {
  CONNECTED: 'Connectée',
  DISCONNECTED: 'Déconnectée',
  ERROR: 'Erreur',
}

export const DEFAULT_SOURCE_STATUS: BackupSourceStatus = 'CONNECTED'
