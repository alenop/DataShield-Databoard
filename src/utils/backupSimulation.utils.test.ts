import {
  BACKUP_SIMULATION_DURATION_MS,
  BACKUP_SIZE_INCREMENT_GB,
  getBackupProgressPercent,
  getLaunchFailureNotification,
  getLaunchSuccessNotification,
} from './backupSimulation.utils'

describe('backupSimulation.utils', () => {
  it('calculates progress percent from size', () => {
    expect(getBackupProgressPercent(0)).toBe(0)
    expect(getBackupProgressPercent(40)).toBe(50)
    expect(getBackupProgressPercent(100)).toBe(100)
  })

  it('returns notification messages', () => {
    expect(getLaunchSuccessNotification('Salesforce')).toContain('Salesforce')
    expect(getLaunchFailureNotification()).toContain('Échec')
  })

  it('uses 8 second simulation duration', () => {
    expect(BACKUP_SIMULATION_DURATION_MS).toBe(8000)
    expect(BACKUP_SIZE_INCREMENT_GB).toBe(10)
  })
})
