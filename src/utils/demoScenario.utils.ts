import { ALERTS_STORAGE_KEY } from '../hooks/useAlerts'
import { BACKUP_SCHEDULES_STORAGE_KEY } from '../hooks/useBackupSchedules'
import { POLICIES_STORAGE_KEY } from '../hooks/useBackupPolicies'
import { BACKUP_SOURCES_STORAGE_KEY } from '../hooks/useBackupSources'
import { EXPORTS_STORAGE_KEY } from '../hooks/useDataExports'
import { RESTORE_JOBS_STORAGE_KEY } from '../hooks/useRestoreJobs'
import { ROLES_STORAGE_KEY } from '../hooks/useRoles'
import { USERS_STORAGE_KEY } from '../hooks/useUsers'
import { currentUser } from '../data/currentUser'
import { buildDemoScenarioPack } from '../data/demoScenarios'
import type { AuditEvent } from '../types/audit.types'
import type { BackupRecord } from '../types/backup.types'
import type { BackupSource } from '../types/backupSource.types'
import type { DemoCurrentUser, DemoScenarioSelection } from '../types/demoScenario.types'
import {
  AUDIT_EVENTS_STORAGE_KEY,
  BACKUP_RECORDS_STORAGE_KEY,
  CURRENT_USER_STORAGE_KEY,
  DEMO_PACK_VERSION,
  DEMO_PACK_VERSION_KEY,
  DEMO_SCENARIO_APPLIED_KEY,
  DEMO_SCENARIO_STORAGE_KEY,
  isDemoScenarioSelection,
} from '../types/demoScenario.types'
import { getDefaultDemoScenarioSelection } from '../data/demoScenarios'
import { filterBackupsWithKnownSources } from './backupRecord.utils'
import { normalizeAuditEvents } from './auditLogger.utils'

export function getStoredDemoScenarioSelection(): DemoScenarioSelection {
  const stored = localStorage.getItem(DEMO_SCENARIO_STORAGE_KEY)
  return isDemoScenarioSelection(stored) ? stored : getDefaultDemoScenarioSelection()
}

export function loadDemoCurrentUser(): DemoCurrentUser {
  const stored = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored)
      if (
        parsed &&
        typeof parsed === 'object' &&
        'id' in parsed &&
        'name' in parsed &&
        'email' in parsed &&
        'roleId' in parsed
      ) {
        return parsed as DemoCurrentUser
      }
    } catch {
      // fall through
    }
  }

  return {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    roleId: currentUser.roleId,
  }
}

export function loadAuditEventsFromStorage(fallback: AuditEvent[]): AuditEvent[] {
  const stored = localStorage.getItem(AUDIT_EVENTS_STORAGE_KEY)
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    const normalized = normalizeAuditEvents(parsed)
    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

export function loadBackupRecordsFromStorage(
  fallback: BackupRecord[],
  sources: BackupSource[] = [],
): BackupRecord[] {
  const stored = localStorage.getItem(BACKUP_RECORDS_STORAGE_KEY)
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const records = parsed as BackupRecord[]
    return sources.length > 0 ? filterBackupsWithKnownSources(records, sources) : records
  } catch {
    return fallback
  }
}

export function applyDemoScenario(id: DemoScenarioSelection): void {
  const pack = buildDemoScenarioPack(id)

  localStorage.setItem(DEMO_SCENARIO_STORAGE_KEY, id)
  localStorage.setItem(DEMO_SCENARIO_APPLIED_KEY, id)
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(pack.currentUser))
  localStorage.setItem(BACKUP_SOURCES_STORAGE_KEY, JSON.stringify(pack.sources))
  localStorage.setItem(BACKUP_RECORDS_STORAGE_KEY, JSON.stringify(pack.backupRecords))
  localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(pack.alerts))
  localStorage.setItem(RESTORE_JOBS_STORAGE_KEY, JSON.stringify(pack.restoreJobs))
  localStorage.setItem(AUDIT_EVENTS_STORAGE_KEY, JSON.stringify(pack.auditEvents))
  localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(pack.policies))
  localStorage.setItem(EXPORTS_STORAGE_KEY, JSON.stringify(pack.exports))
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(pack.users))
  localStorage.setItem(BACKUP_SCHEDULES_STORAGE_KEY, JSON.stringify(pack.schedules))
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(pack.roles))
  localStorage.setItem(DEMO_PACK_VERSION_KEY, DEMO_PACK_VERSION)
}

export function ensureDemoScenarioApplied(): DemoScenarioSelection {
  const scenarioId = getStoredDemoScenarioSelection()
  const applied = localStorage.getItem(DEMO_SCENARIO_APPLIED_KEY)

  const packVersion = localStorage.getItem(DEMO_PACK_VERSION_KEY)

  if (
    applied !== scenarioId ||
    !localStorage.getItem(BACKUP_SOURCES_STORAGE_KEY) ||
    packVersion !== DEMO_PACK_VERSION
  ) {
    applyDemoScenario(scenarioId)
  }

  return scenarioId
}

export function appendAuditEvent(event: AuditEvent): void {
  const scenarioId = getStoredDemoScenarioSelection()
  const fallback = buildDemoScenarioPack(scenarioId).auditEvents
  const current = loadAuditEventsFromStorage(fallback)
  localStorage.setItem(AUDIT_EVENTS_STORAGE_KEY, JSON.stringify([event, ...current]))
}

export function getActiveDemoScenarioSelection(): DemoScenarioSelection {
  return getStoredDemoScenarioSelection()
}
