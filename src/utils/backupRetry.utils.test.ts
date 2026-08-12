import type { BackupRecord } from '../types/backup.types'
import {
  getRetryDelayMs,
  markBackupInProgress,
  resolveRetryOutcome,
  resolveUserStoppedOutcome,
} from './backupRetry.utils'

const baseRecord: BackupRecord = {
  id: '1',
  name: 'Test',
  sourceId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  source: 'Salesforce Production Core',
  date: '2026-08-07T06:00:00',
  sizeGb: 10,
  status: 'failure',
  durationMinutes: 5,
  errorReason: 'Old reason',
  errorMessage: 'OLD_ERROR',
  scopes: ['full'],
}

describe('markBackupInProgress', () => {
  it('sets status to in_progress and clears errors', () => {
    const result = markBackupInProgress(baseRecord)
    expect(result.status).toBe('in_progress')
    expect(result.errorReason).toBeUndefined()
    expect(result.errorMessage).toBeUndefined()
  })
})

describe('resolveRetryOutcome', () => {
  it('returns failure with error message when retrying a failed backup', () => {
    const outcome = resolveRetryOutcome(true)
    expect(outcome.status).toBe('failure')
    expect(outcome.errorMessage).toBeDefined()
    expect(outcome.errorReason).toBeDefined()
  })

  it('returns success when retrying a non-failed backup', () => {
    const outcome = resolveRetryOutcome(false)
    expect(outcome.status).toBe('success')
    expect(outcome.errorMessage).toBeUndefined()
  })
})

describe('getRetryDelayMs', () => {
  it('returns a positive delay', () => {
    expect(getRetryDelayMs()).toBeGreaterThan(0)
  })
})

describe('resolveUserStoppedOutcome', () => {
  it('returns failure with username in error message', () => {
    const outcome = resolveUserStoppedOutcome('Admin Demo')
    expect(outcome.status).toBe('failure')
    expect(outcome.errorMessage).toBe("Arrêtée par l'utilisateur : Admin Demo")
    expect(outcome.errorReason).toBe('Sauvegarde annulée')
  })
})
