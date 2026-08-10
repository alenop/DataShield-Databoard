import { useTranslation } from 'react-i18next'
import { AlertTriangle, Bell, CheckCheck, Info, ShieldAlert } from 'lucide-react'
import type { AlertsState } from '../../hooks/useAlerts'
import type { Alert, AlertSeverity } from '../../types/alert.types'
import { formatAlertDateTime } from '../../utils/alert.utils'

interface AlertsPageProps {
  alertsState: AlertsState
}

export function AlertsPage({ alertsState }: AlertsPageProps) {
  const { t } = useTranslation()
  const { alerts, summary, notification, markAsResolved } = alertsState

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('pages.alerts.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.alerts.subtitle')}
        </p>
      </div>

      {notification && (
        <div
          role="status"
          className={[
            'rounded-lg border px-4 py-3 text-sm',
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
          ].join(' ')}
        >
          {notification.message}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label={t('pages.alerts.critical')}
          count={summary.critical}
          icon={ShieldAlert}
          tone="critical"
        />
        <SummaryCard
          label={t('pages.alerts.warnings')}
          count={summary.warning}
          icon={AlertTriangle}
          tone="warning"
        />
        <SummaryCard
          label={t('pages.alerts.resolved')}
          count={summary.resolved}
          icon={CheckCheck}
          tone="resolved"
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <Bell className="h-4 w-4" aria-hidden="true" />
          {t('common.countWithLabel', { label: t('pages.alerts.feed'), count: alerts.length })}
        </h2>

        {alerts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.alerts.noAlerts')}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
            {alerts.map((alert) => (
              <AlertFeedItem key={alert.id} alert={alert} onResolve={markAsResolved} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  count: number
  icon: typeof ShieldAlert
  tone: 'critical' | 'warning' | 'resolved'
}

const summaryCardStyles: Record<SummaryCardProps['tone'], string> = {
  critical: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50',
  resolved: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50',
}

const summaryCountStyles: Record<SummaryCardProps['tone'], string> = {
  critical: 'text-red-700 dark:text-red-300',
  warning: 'text-amber-700 dark:text-amber-300',
  resolved: 'text-emerald-700 dark:text-emerald-300',
}

const summaryIconStyles: Record<SummaryCardProps['tone'], string> = {
  critical: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  resolved: 'text-emerald-600 dark:text-emerald-400',
}

function SummaryCard({ label, count, icon: Icon, tone }: SummaryCardProps) {
  return (
    <article
      className={[
        'rounded-xl border p-5 shadow-sm',
        summaryCardStyles[tone],
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className={['mt-2 text-3xl font-bold', summaryCountStyles[tone]].join(' ')}>
            {count}
          </p>
        </div>
        <Icon className={['h-6 w-6 shrink-0', summaryIconStyles[tone]].join(' ')} aria-hidden="true" />
      </div>
    </article>
  )
}

interface AlertFeedItemProps {
  alert: Alert
  onResolve: (alertId: string) => string | null
}

function AlertFeedItem({ alert, onResolve }: AlertFeedItemProps) {
  const { t } = useTranslation()
  const isResolved = alert.status === 'resolved'

  return (
    <li className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <AlertSeverityBadge severity={alert.severity} />
          {isResolved && (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t('common.resolved')}
            </span>
          )}
        </div>

        <p
          className={[
            'text-sm leading-relaxed',
            isResolved
              ? 'text-slate-500 line-through dark:text-slate-500'
              : 'font-medium text-slate-900 dark:text-slate-100',
          ].join(' ')}
        >
          {alert.message}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('common.triggeredAt', { date: formatAlertDateTime(alert.triggeredAt) })}
          {alert.resolvedAt && (
            <span>{t('common.resolvedAt', { date: formatAlertDateTime(alert.resolvedAt) })}</span>
          )}
        </p>
      </div>

      <button
        type="button"
        disabled={isResolved}
        onClick={() => onResolve(alert.id)}
        className={[
          'inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs font-medium transition-colors',
          isResolved
            ? 'cursor-default bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
            : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-600 dark:hover:text-white',
        ].join(' ')}
      >
        <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {isResolved ? t('common.resolved') : t('common.markResolved')}
      </button>
    </li>
  )
}

interface AlertSeverityBadgeProps {
  severity: AlertSeverity
}

const severityStyles: Record<AlertSeverity, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
}

function AlertSeverityBadge({ severity }: AlertSeverityBadgeProps) {
  const { t } = useTranslation()
  const Icon = severity === 'info' ? Info : severity === 'warning' ? AlertTriangle : ShieldAlert

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        severityStyles[severity],
      ].join(' ')}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(`status.alert.${severity}`)}
    </span>
  )
}
