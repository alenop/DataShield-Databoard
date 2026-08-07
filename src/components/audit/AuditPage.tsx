import type { AuditEventsState } from '../../hooks/useAuditEvents'
import {
  auditEventStatusLabels,
  type AuditEventStatus,
} from '../../types/audit.types'
import { formatAuditDateTime } from '../../utils/auditFormatters'
import { AuditSearchBar } from './AuditSearchBar'

interface AuditPageProps {
  auditEvents: AuditEventsState
}

export function AuditPage({ auditEvents }: AuditPageProps) {
  const { events, query, setQuery, totalCount, filteredCount } = auditEvents

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Journal d&apos;audit
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Historique chronologique des actions effectuées sur la plateforme.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Événements
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {query
                ? `${filteredCount} résultat${filteredCount > 1 ? 's' : ''} sur ${totalCount}`
                : `${totalCount} événement${totalCount > 1 ? 's' : ''}`}
            </p>
          </div>
          <AuditSearchBar query={query} onQueryChange={setQuery} />
        </div>

        {events.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Aucun événement ne correspond à votre recherche.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Date &amp; Heure
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Utilisateur / Acteur
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Adresse IP
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {formatAuditDateTime(event.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {event.actor}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {event.action}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {event.ipAddress}
                    </td>
                    <td className="px-4 py-3">
                      <AuditStatusBadge status={event.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

interface AuditStatusBadgeProps {
  status: AuditEventStatus
}

const statusStyles: Record<AuditEventStatus, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  denied: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

function AuditStatusBadge({ status }: AuditStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {auditEventStatusLabels[status]}
    </span>
  )
}
