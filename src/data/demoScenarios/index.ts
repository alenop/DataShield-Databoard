import type { DemoScenarioId, DemoScenarioSelection } from '../../types/demoScenario.types'
import { buildBackupRecordsFromTemplates } from '../mockBackups'
import { adminScenarioData, adminScenarioReferenceDate } from './adminScenario'
import { buildDefaultScenarioPack } from './defaultScenario'
import { dpoScenarioData, dpoScenarioReferenceDate } from './dpoScenario'
import { secopsScenarioData, secopsScenarioReferenceDate } from './secopsScenario'
import type { DemoScenarioData, DemoScenarioPack } from './types'

const SCENARIO_DATA: Record<DemoScenarioId, DemoScenarioData> = {
  admin: adminScenarioData,
  secops: secopsScenarioData,
  dpo: dpoScenarioData,
}

const SCENARIO_REFERENCE_DATES: Record<DemoScenarioId, Date> = {
  admin: adminScenarioReferenceDate,
  secops: secopsScenarioReferenceDate,
  dpo: dpoScenarioReferenceDate,
}

export function getDemoScenarioData(id: DemoScenarioId): DemoScenarioData {
  return SCENARIO_DATA[id]
}

export function buildDemoScenarioPack(id: DemoScenarioSelection): DemoScenarioPack {
  if (id === 'none') {
    return buildDefaultScenarioPack()
  }

  const data = getDemoScenarioData(id)
  const referenceDate = SCENARIO_REFERENCE_DATES[id]

  return {
    ...data,
    backupRecords: buildBackupRecordsFromTemplates(
      data.backupTemplates,
      data.sources,
      referenceDate,
    ),
  }
}

export function getDefaultDemoScenarioSelection(): DemoScenarioSelection {
  return 'none'
}

/** @deprecated Use getDefaultDemoScenarioSelection */
export function getDefaultDemoScenarioId(): DemoScenarioId {
  return 'admin'
}

export { SCENARIO_DATA }
