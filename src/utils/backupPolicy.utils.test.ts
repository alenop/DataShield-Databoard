import {
  createBackupPolicy,
  validateCreatePolicyInput,
} from './backupPolicy.utils'

describe('backupPolicy.utils', () => {
  const sourceIds = ['source-1', 'source-2']

  it('validates policy name and sources', () => {
    expect(
      validateCreatePolicyInput(
        {
          name: '',
          frequencyPresetId: 'daily-02',
          retentionDays: 30,
          sourceIds: ['source-1'],
        },
        [],
        sourceIds,
      ),
    ).toContain('nom')

    expect(
      validateCreatePolicyInput(
        {
          name: 'Test Policy',
          frequencyPresetId: 'daily-02',
          retentionDays: 30,
          sourceIds: [],
        },
        [],
        sourceIds,
      ),
    ).toContain('source')
  })

  it('creates a policy from preset', () => {
    const policy = createBackupPolicy({
      name: 'Sauvegarde Test',
      frequencyPresetId: 'every-4h',
      retentionDays: 30,
      sourceIds: ['source-1'],
    })

    expect(policy.name).toBe('Sauvegarde Test')
    expect(policy.cronExpression).toBe('0 */4 * * *')
    expect(policy.frequencyLabel).toBe('Toutes les 4 heures')
    expect(policy.isActive).toBe(true)
  })
})
