import i18n from '../i18n'
import type { BackupSource, BackupSourceStatus } from '../types/backupSource.types'
import { STAGING_SOURCE_ID } from '../data/demoScenarios/shared'
import { DEMO_SCENARIO_STORAGE_KEY } from '../types/demoScenario.types'

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
  await delay(1500)

  const scenario = localStorage.getItem(DEMO_SCENARIO_STORAGE_KEY)
  if (scenario === 'secops' && source.id === STAGING_SOURCE_ID) {
    return {
      status: 'DISCONNECTED',
      message: i18n.t('notifications.connectionFailureOAuth', { source: source.name }),
    }
  }

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
