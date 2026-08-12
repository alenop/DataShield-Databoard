import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Clock,
  FileOutput,
  HardDrive,
  ListOrdered,
  Play,
  ScrollText,
  Shield,
  Sparkles,
  UserRound,
} from 'lucide-react'
import type { DemoScenarioState } from '../../hooks/useDemoScenario'
import type { DemoScenarioId } from '../../types/demoScenario.types'
import { DEMO_GUIDE_SCENARIOS } from '../../types/demoGuide.types'

interface DemoGuidePageProps {
  demoScenario: DemoScenarioState
  onLaunchScenario: (scenarioId: DemoScenarioId, startPageId: string) => void
}

const scenarioIcons: Record<DemoScenarioId, typeof HardDrive> = {
  admin: HardDrive,
  secops: AlertTriangle,
  dpo: FileOutput,
}

const scenarioAccentStyles: Record<DemoScenarioId, string> = {
  admin: 'border-blue-200 bg-blue-50/80 dark:border-blue-900 dark:bg-blue-950/30',
  secops: 'border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30',
  dpo: 'border-violet-200 bg-violet-50/80 dark:border-violet-900 dark:bg-violet-950/30',
}

const scenarioIconStyles: Record<DemoScenarioId, string> = {
  admin: 'text-blue-600 dark:text-blue-400',
  secops: 'text-amber-600 dark:text-amber-400',
  dpo: 'text-violet-600 dark:text-violet-400',
}

export function DemoGuidePage({ demoScenario, onLaunchScenario }: DemoGuidePageProps) {
  const { t } = useTranslation()
  const { scenarioId } = demoScenario

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Sparkles className="h-6 w-6 text-indigo-500" aria-hidden="true" />
          {t('pages.demoGuide.title')}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          {t('pages.demoGuide.subtitle')}
        </p>
      </div>

      <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
        <p className="text-sm text-slate-700 dark:text-slate-300">{t('pages.demoGuide.intro')}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-1">
        {DEMO_GUIDE_SCENARIOS.map((config) => (
          <DemoScenarioCard
            key={config.id}
            config={config}
            isActive={scenarioId === config.id}
            onLaunch={() => onLaunchScenario(config.id, config.startPageId)}
          />
        ))}
      </div>
    </div>
  )
}

interface DemoScenarioCardProps {
  config: (typeof DEMO_GUIDE_SCENARIOS)[number]
  isActive: boolean
  onLaunch: () => void
}

function DemoScenarioCard({ config, isActive, onLaunch }: DemoScenarioCardProps) {
  const { t } = useTranslation()
  const Icon = scenarioIcons[config.id]
  const steps = Array.from({ length: config.stepCount }, (_, index) =>
    t(`pages.demoGuide.scenarios.${config.id}.steps.${index + 1}`),
  )
  const highlights = Array.from({ length: 3 }, (_, index) =>
    t(`pages.demoGuide.scenarios.${config.id}.highlights.${index + 1}`),
  )

  return (
    <article
      className={[
        'rounded-xl border p-6 shadow-sm',
        scenarioAccentStyles[config.id],
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-start gap-3">
            <div
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-slate-900/60',
                scenarioIconStyles[config.id],
              ].join(' ')}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t(`pages.demoGuide.scenarios.${config.id}.title`)}
                </h2>
                {isActive && (
                  <span className="inline-flex rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    {t('pages.demoGuide.activeScenario')}
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(`pages.demoGuide.scenarios.${config.id}.persona`)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('pages.demoGuide.estimatedDuration', { minutes: config.estimatedMinutes })}
                </span>
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {t(`pages.demoGuide.scenarios.${config.id}.context`)}
          </p>

          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
              <ListOrdered className="h-4 w-4" aria-hidden="true" />
              {t('pages.demoGuide.suggestedPath')}
            </h3>
            <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              {steps.map((step, index) => (
                <li key={`${config.id}-step-${index}`}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
              <Shield className="h-4 w-4" aria-hidden="true" />
              {t('pages.demoGuide.keyPoints')}
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              {highlights.map((highlight, index) => (
                <li key={`${config.id}-highlight-${index}`} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ScrollText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t(`pages.demoGuide.scenarios.${config.id}.auditNote`)}
          </p>
        </div>

        <button
          type="button"
          onClick={onLaunch}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          {t('pages.demoGuide.launchScenario')}
        </button>
      </div>
    </article>
  )
}
