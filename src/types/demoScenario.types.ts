export const DEMO_SCENARIO_IDS = ['admin', 'secops', 'dpo'] as const

export type DemoScenarioId = (typeof DEMO_SCENARIO_IDS)[number]

export type DemoScenarioSelection = DemoScenarioId | 'none'

export const DEMO_SCENARIO_OPTIONS: DemoScenarioSelection[] = [
  'none',
  'admin',
  'secops',
  'dpo',
]

/** @deprecated Use DEMO_SCENARIO_IDS */
export const DEMO_SCENARIOS = DEMO_SCENARIO_IDS

export const DEMO_SCENARIO_STORAGE_KEY = 'datashield-demo-scenario'
export const DEMO_SCENARIO_APPLIED_KEY = 'datashield-demo-scenario-applied'
export const DEMO_PACK_VERSION_KEY = 'datashield-demo-pack-version'
/** Bump when demo seed data shape changes (e.g. backup scopes). */
export const DEMO_PACK_VERSION = '6'
export const CURRENT_USER_STORAGE_KEY = 'datashield-current-user'
export const AUDIT_EVENTS_STORAGE_KEY = 'datashield-audit-events'
export const BACKUP_RECORDS_STORAGE_KEY = 'datashield-backup-records'

export interface DemoCurrentUser {
  id: string
  name: string
  email: string
  roleId: string
}

export function isDemoScenarioId(value: string | null): value is DemoScenarioId {
  return value === 'admin' || value === 'secops' || value === 'dpo'
}

export function isDemoScenarioSelection(value: string | null): value is DemoScenarioSelection {
  return value === 'none' || isDemoScenarioId(value)
}
