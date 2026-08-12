import type { DemoScenarioId } from './demoScenario.types'

export const DEMO_LAUNCH_PAGE_KEY = 'datashield-demo-launch-page'

export interface DemoGuideScenarioConfig {
  id: DemoScenarioId
  startPageId: string
  stepCount: number
  estimatedMinutes: number
}

export const DEMO_GUIDE_SCENARIOS: DemoGuideScenarioConfig[] = [
  {
    id: 'admin',
    startPageId: 'backups',
    stepCount: 5,
    estimatedMinutes: 3,
  },
  {
    id: 'secops',
    startPageId: 'alerts',
    stepCount: 5,
    estimatedMinutes: 3,
  },
  {
    id: 'dpo',
    startPageId: 'exports',
    stepCount: 5,
    estimatedMinutes: 4,
  },
]
