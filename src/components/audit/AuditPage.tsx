import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { AuditEventsState } from '../../hooks/useAuditEvents'
import type { AuditEvent, AuditSeverity } from '../../types/audit.types'
import { formatAuditDateTime } from '../../utils/auditFormatters'
import {
  getAuditActionLabel,
  getAuditCategoryLabel,
  getAuditResourceTypeLabel,
} from '../../utils/auditLogger.utils'
import { AuditFilterBar } from './AuditFilterBar'
import { AuditSearchBar } from './AuditSearchBar'

interface AuditPageProps {
  auditEvents: AuditEventsState
}

export function AuditPage({ auditEvents }: AuditPageProps) {
  const { t } = useTranslation()
  const { events, query, setQuery, totalCount, filteredCount } = auditEvents
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const eventCountLabel = query || auditEvents.hasActiveFilters
    ? t('common.auditResults', { count: filteredCount, total: totalCount })
    : t('common.auditEvents', { count: totalCount })

  const toggleExpanded = (eventId: string) => {
    setExpandedId((current) => (current === eventId ? null : eventId))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('pages.audit.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.audit.subtitle')}
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {t('pages.audit.events')}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {eventCountLabel}
            </p>
          </div>
          <AuditSearchBar query={query} onQueryChange={setQuery} />
        </div>

        <div className="mt-4">
          <AuditFilterBar auditEvents={auditEvents} />
        </div>

        {events.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.audit.noEvents')}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="w-10 px-2 py-3" aria-hidden="true" />
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t('common.dateTime')}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t('common.actor')}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t('common.action')}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t('pages.audit.filters.resourceType')}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t('pages.audit.filters.severity')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {events.map((event) => {
                  const isExpanded = expandedId === event.id

                  return (
                    <Fragment key={event.id}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(event.id)}
                            aria-expanded={isExpanded}
                            aria-label={t('pages.audit.toggleDetails', { action: getAuditActionLabel(event, t) })}
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                          {formatAuditDateTime(event.timestamp)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {event.actor}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {getAuditActionLabel(event, t)}
                        </td>
                        <td className="px-4 py-3">
                          <ResourceTypeBadge resourceType={event.resourceType} />
                        </td>
                        <td className="px-4 py-3">
                          <AuditSeverityBadge severity={event.severity} />
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50 dark:bg-slate-800/40">
                          <td colSpan={6} className="px-4 py-4">
                            <AuditEventDetails event={event} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

interface AuditEventDetailsProps {
  event: AuditEvent
}

function AuditEventDetails({ event }: AuditEventDetailsProps) {
  const { t } = useTranslation()

  const detailItems = [
    { label: t('pages.audit.details.actionCode'), value: event.actionCode },
    { label: t('pages.audit.details.category'), value: getAuditCategoryLabel(event.category, t) },
    {
      label: t('pages.audit.details.resourceType'),
      value: getAuditResourceTypeLabel(event.resourceType, t),
    },
    { label: t('pages.audit.details.actorEmail'), value: event.actorEmail ?? t('common.emptyDash') },
    { label: t('common.ipAddress'), value: event.ipAddress },
    { label: t('pages.audit.details.status'), value: t(`status.audit.${event.status}`) },
  ]

  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {detailItems.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">{item.value}</dd>
        </div>
      ))}
      {event.metadata && Object.keys(event.metadata).length > 0 && (
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('pages.audit.details.metadata')}
          </dt>
          <dd className="mt-1 space-y-1">
            {Object.entries(event.metadata).map(([key, value]) => (
              <p key={key} className="font-mono text-xs text-slate-700 dark:text-slate-300">
                {key}: {value}
              </p>
            ))}
          </dd>
        </div>
      )}
    </dl>
  )
}

interface AuditSeverityBadgeProps {
  severity: AuditSeverity
}

const severityStyles: Record<AuditSeverity, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  failure: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
}

function AuditSeverityBadge({ severity }: AuditSeverityBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        severityStyles[severity],
      ].join(' ')}
    >
      {t(`pages.audit.filters.severityOptions.${severity}`)}
    </span>
  )
}

interface ResourceTypeBadgeProps {
  resourceType: AuditEvent['resourceType']
}

function ResourceTypeBadge({ resourceType }: ResourceTypeBadgeProps) {
  const { t } = useTranslation()

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {getAuditResourceTypeLabel(resourceType, t)}
    </span>
  )
}
