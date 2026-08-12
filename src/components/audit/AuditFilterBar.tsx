import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import type { AuditEventsState } from '../../hooks/useAuditEvents'
import type { AuditEventFilters } from '../../types/audit.types'
import {
  AUDIT_ACTION_GROUPS,
  AUDIT_DATE_PRESETS,
  AUDIT_RESOURCE_TYPES,
  AUDIT_SEVERITY_FILTERS,
} from '../../types/audit.types'
import { filterAuditActorOptions } from '../../utils/auditFilters.utils'
import { getAuditActionFilterLabel } from '../../utils/auditLogger.utils'

interface AuditFilterBarProps {
  auditEvents: AuditEventsState
}

const selectClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white'

export function AuditFilterBar({ auditEvents }: AuditFilterBarProps) {
  const { t } = useTranslation()
  const { filters, updateFilter, resetFilters, hasActiveFilters, actorOptions } = auditEvents
  const [actorSearch, setActorSearch] = useState('')

  const filteredActors = useMemo(
    () => filterAuditActorOptions(actorOptions, actorSearch),
    [actorOptions, actorSearch],
  )

  const setFilter = <Key extends keyof AuditEventFilters>(
    key: Key,
    value: AuditEventFilters[Key],
  ) => {
    updateFilter(key, value)
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t('pages.audit.filters.title')}
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {t('pages.audit.filters.reset')}
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('pages.audit.filters.date')}
          </span>
          <select
            value={filters.datePreset}
            onChange={(event) => setFilter('datePreset', event.target.value as AuditEventFilters['datePreset'])}
            className={selectClassName}
            aria-label={t('pages.audit.filters.date')}
          >
            {AUDIT_DATE_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {t(`pages.audit.filters.datePresets.${preset}`)}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('pages.audit.filters.actor')}
          </span>
          <input
            type="search"
            value={actorSearch}
            onChange={(event) => setActorSearch(event.target.value)}
            placeholder={t('pages.audit.filters.actorSearchPlaceholder')}
            className={selectClassName}
            aria-label={t('pages.audit.filters.actorSearchAria')}
          />
          <select
            value={filters.actor}
            onChange={(event) => setFilter('actor', event.target.value)}
            className={selectClassName}
            aria-label={t('pages.audit.filters.actor')}
          >
            <option value="all">{t('pages.audit.filters.allActors')}</option>
            {filteredActors.map((option) => (
              <option key={option.value} value={option.value}>
                {option.email ? `${option.label} (${option.email})` : option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('pages.audit.filters.actionType')}
          </span>
          <select
            value={filters.actionType}
            onChange={(event) =>
              setFilter('actionType', event.target.value as AuditEventFilters['actionType'])
            }
            className={selectClassName}
            aria-label={t('pages.audit.filters.actionType')}
          >
            <option value="all">{t('pages.audit.filters.allActions')}</option>
            {AUDIT_ACTION_GROUPS.map((group) => (
              <optgroup key={group.labelKey} label={t(group.labelKey)}>
                {group.actions.map((action) => (
                  <option key={action} value={action}>
                    {getAuditActionFilterLabel(action, t)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('pages.audit.filters.severity')}
          </span>
          <select
            value={filters.severity}
            onChange={(event) =>
              setFilter('severity', event.target.value as AuditEventFilters['severity'])
            }
            className={selectClassName}
            aria-label={t('pages.audit.filters.severity')}
          >
            {AUDIT_SEVERITY_FILTERS.map((severity) => (
              <option key={severity} value={severity}>
                {t(`pages.audit.filters.severityOptions.${severity}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('pages.audit.filters.resourceType')}
          </span>
          <select
            value={filters.resourceType}
            onChange={(event) =>
              setFilter('resourceType', event.target.value as AuditEventFilters['resourceType'])
            }
            className={selectClassName}
            aria-label={t('pages.audit.filters.resourceType')}
          >
            <option value="all">{t('pages.audit.filters.allResources')}</option>
            {AUDIT_RESOURCE_TYPES.map((resourceType) => (
              <option key={resourceType} value={resourceType}>
                {t(`audit.resourceTypes.${resourceType}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
