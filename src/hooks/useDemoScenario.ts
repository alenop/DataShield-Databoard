import { useCallback, useMemo, useState } from 'react'
import { buildDemoScenarioPack } from '../data/demoScenarios'
import type { DemoCurrentUser, DemoScenarioSelection } from '../types/demoScenario.types'
import {
  applyDemoScenario,
  ensureDemoScenarioApplied,
  loadDemoCurrentUser,
} from '../utils/demoScenario.utils'

export function useDemoScenario() {
  const [scenarioId, setScenarioId] = useState<DemoScenarioSelection>(() =>
    ensureDemoScenarioApplied(),
  )
  const [version, setVersion] = useState(0)

  const switchScenario = useCallback(
    (nextScenarioId: DemoScenarioSelection) => {
      if (nextScenarioId === scenarioId) return
      applyDemoScenario(nextScenarioId)
      setScenarioId(nextScenarioId)
      setVersion((current) => current + 1)
    },
    [scenarioId],
  )

  const currentUser: DemoCurrentUser = useMemo(() => {
    void version
    return loadDemoCurrentUser()
  }, [scenarioId, version])

  const scenarioMeta = useMemo(() => buildDemoScenarioPack(scenarioId), [scenarioId])

  return {
    scenarioId,
    switchScenario,
    version,
    currentUser,
    scenarioMeta,
  }
}

export type DemoScenarioState = ReturnType<typeof useDemoScenario>
