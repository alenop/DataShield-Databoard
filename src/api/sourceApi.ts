import i18n from '../i18n'
import type { BackupSource, BackupSourceStatus } from '../types/backupSource.types'

export interface SourceTestResponse {
  status: BackupSourceStatus
  message: string
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Simule POST /api/sources/{id}/test
 * En production, cette fonction appellerait fetch() vers le backend.
 */
export async function postSourceConnectionTest(
  source: BackupSource,
): Promise<SourceTestResponse> {
  await delay(1000 + Math.random() * 1000)

  const isSuccess = Math.random() >= 0.25

  if (isSuccess) {
    return {
      status: 'CONNECTED',
      message: i18n.t('notifications.connectionSuccess', { source: source.name }),
    }
  }

  return {
    status: 'DISCONNECTED',
    message: i18n.t('notifications.connectionFailure'),
  }
}
