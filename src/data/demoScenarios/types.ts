import type { Alert } from '../../types/alert.types'
import type { BackupRecord } from '../../types/backup.types'
import type { BackupPolicy } from '../../types/backupPolicy.types'
import type { BackupSchedule } from '../../types/backupSchedule.types'
import type { BackupSource } from '../../types/backupSource.types'
import type { AuditEvent } from '../../types/audit.types'
import type { DataExport } from '../../types/dataExport.types'
import type { DemoCurrentUser, DemoScenarioSelection } from '../../types/demoScenario.types'
import type { RestoreJob } from '../../types/restoreJob.types'
import type { RoleDefinition } from '../../types/role.types'
import type { User } from '../../types/user.types'
import type { MockBackupTemplate } from '../mockBackups'

export interface DemoScenarioData {
  id: DemoScenarioSelection
  currentUser: DemoCurrentUser
  sources: BackupSource[]
  backupTemplates: MockBackupTemplate[]
  alerts: Alert[]
  restoreJobs: RestoreJob[]
  auditEvents: AuditEvent[]
  policies: BackupPolicy[]
  exports: DataExport[]
  users: User[]
  schedules: BackupSchedule[]
  roles: RoleDefinition[]
}

export interface DemoScenarioPack extends DemoScenarioData {
  backupRecords: BackupRecord[]
}
