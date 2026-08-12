import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { DEMO_SCENARIO_OPTIONS, type DemoScenarioSelection } from '../../types/demoScenario.types'
import type { DemoScenarioState } from '../../hooks/useDemoScenario'

interface DemoScenarioSwitcherProps {
  demoScenario: DemoScenarioState
  onOpenDemoGuide?: () => void
}

export function DemoScenarioSwitcher({ demoScenario, onOpenDemoGuide }: DemoScenarioSwitcherProps) {
  const { t } = useTranslation()
  const { scenarioId, switchScenario, currentUser } = demoScenario

  const roleLabel =
    scenarioId === 'none'
      ? t('demo.roles.super_admin')
      : t(`demo.roles.${currentUser.roleId}`, currentUser.roleId)

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/40">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            {t('demo.label')}
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {t('demo.persona', { name: currentUser.name, role: roleLabel })}
          </p>
        </div>

        <div className="min-w-0 lg:max-w-xl lg:flex-1">
          <label htmlFor="demo-scenario-select" className="sr-only">
            {t('demo.selectLabel')}
          </label>
          <select
            id="demo-scenario-select"
            value={scenarioId}
            onChange={(event) => switchScenario(event.target.value as DemoScenarioSelection)}
            className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-800 dark:bg-slate-900 dark:text-white"
          >
            {DEMO_SCENARIO_OPTIONS.map((id) => (
              <option key={id} value={id}>
                {t(`demo.scenarios.${id}.option`)}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
            {t(`demo.scenarios.${scenarioId}.hint`)}
          </p>
        </div>

        {onOpenDemoGuide && (
          <button
            type="button"
            onClick={onOpenDemoGuide}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {t('demo.openGuide')}
          </button>
        )}
      </div>
    </section>
  )
}
