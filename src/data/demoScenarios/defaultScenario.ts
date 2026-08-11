import { currentUser } from '../currentUser'
import { defaultBackupSources } from '../defaultBackupSources'
import { defaultRoles } from '../defaultRoles'
import { buildMockBackupRecords } from '../mockBackups'
import { mockAlerts } from '../mockAlerts'
import { mockAuditEvents } from '../mockAuditEvents'
import { mockBackupPolicies } from '../mockBackupPolicies'
import { mockBackupSchedules } from '../mockBackupSchedules'
import { mockDataExports } from '../mockDataExports'
import { mockRestoreJobs } from '../mockRestoreJobs'
import { mockUsers } from '../mockUsers'
import type { DemoScenarioPack } from './types'

export function buildDefaultScenarioPack(): DemoScenarioPack {
  const sources = defaultBackupSources

  return {
    id: 'none',
    currentUser: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      roleId: currentUser.roleId,
    },
    sources,
    backupTemplates: [],
    backupRecords: buildMockBackupRecords(sources),
    alerts: mockAlerts,
    restoreJobs: mockRestoreJobs,
    auditEvents: mockAuditEvents,
    policies: mockBackupPolicies,
    exports: mockDataExports,
    users: mockUsers,
    schedules: mockBackupSchedules,
    roles: defaultRoles,
  }
}
