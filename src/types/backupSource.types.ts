export type BackupSourceStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

export interface BackupSource {
  id: string
  name: string
  environment: string
  apiEndpoint: string
  status: BackupSourceStatus
}

export interface BackupSourceInput {
  name: string
  environment: string
  apiEndpoint: string
}

export const backupSourceStatusLabels: Record<BackupSourceStatus, string> = {
  CONNECTED: 'Connectée',
  DISCONNECTED: 'Déconnectée',
  ERROR: 'Erreur',
}

export const DEFAULT_SOURCE_STATUS: BackupSourceStatus = 'CONNECTED'
