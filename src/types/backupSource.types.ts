export type BackupSourceStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

export interface BackupSource {
  id: string
  name: string
  environment: string
  apiEndpoint: string
  status: BackupSourceStatus
  scopes: string[]
}

export interface BackupSourceInput {
  name: string
  environment: string
  apiEndpoint: string
  scopes: string[]
}

export const backupSourceStatusLabels: Record<BackupSourceStatus, string> = {
  CONNECTED: 'Connectée',
  DISCONNECTED: 'Déconnectée',
  ERROR: 'Erreur',
}

export const DEFAULT_SOURCE_STATUS: BackupSourceStatus = 'CONNECTED'

export const DEFAULT_SOURCE_SCOPES = ['Données complètes']
