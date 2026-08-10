import { useState } from 'react'
import { CalendarClock, Clock, Database, Pencil, Plus, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { currentUser } from '../../data/currentUser'
import type { BackupPoliciesState } from '../../hooks/useBackupPolicies'
import type { BackupSourcesState } from '../../hooks/useBackupSources'
import type { RolesState } from '../../hooks/useRoles'
import type { BackupPolicy } from '../../types/backupPolicy.types'
import { canViewPolicies } from '../../utils/userPermissions.utils'
import { CreatePolicyModal } from './CreatePolicyModal'
import { EditPolicyModal } from './EditPolicyModal'

interface PoliciesPageProps {
  policiesState: BackupPoliciesState
  backupSources: BackupSourcesState
  rolesState: RolesState
}

export function PoliciesPage({ policiesState, backupSources, rolesState }: PoliciesPageProps) {
  const { t } = useTranslation()
  const {
    policies,
    notification,
    canManage,
    createPolicy,
    updatePolicy,
    togglePolicyActive,
  } = policiesState
  const { sources } = backupSources
  const { roles, getRoleById } = rolesState
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<BackupPolicy | null>(null)

  const actorRole = getRoleById(currentUser.roleId)
  const canView = canViewPolicies(currentUser.roleId, roles)

  if (!canView) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
        <Shield className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
        <h1 className="mt-4 text-lg font-semibold text-red-800 dark:text-red-300">
          {t('common.accessDenied')}
        </h1>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">
          {t('pages.policies.accessDeniedMessage', {
            role: actorRole?.name ?? currentUser.roleId,
          })}
        </p>
      </div>
    )
  }

  const getSourceNames = (sourceIds: string[]) =>
    sourceIds
      .map((id) => sources.find((source) => source.id === id)?.name)
      .filter(Boolean)
      .join(', ')

  const loggedInSubtitle = canManage
    ? t('common.loggedInAs', {
        name: currentUser.name,
        role: actorRole?.name ?? currentUser.roleId,
      })
    : `${t('common.loggedInAs', {
        name: currentUser.name,
        role: actorRole?.name ?? currentUser.roleId,
      })} — ${t('common.readOnly')}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('pages.policies.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loggedInSubtitle}</p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('pages.policies.createPolicy')}
          </button>
        )}
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

      {policies.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-900">
          <CalendarClock
            className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.policies.noPolicies')}
          </p>
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('pages.policies.createPolicy')}
            </button>
          )}
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              sourceNames={getSourceNames(policy.sourceIds)}
              canManage={canManage}
              onToggle={() => togglePolicyActive(policy.id)}
              onEdit={() => setEditingPolicy(policy)}
            />
          ))}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('common.countWithLabel', {
            label: t('pages.policies.tableView'),
            count: policies.length,
          })}
        </h2>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.policy')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.frequencyCron')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.retention')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.source')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.status')}
                </th>
                {canManage && (
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                    {t('common.actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {policy.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700 dark:text-slate-300">{policy.frequencyLabel}</div>
                    <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {policy.cronExpression}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {policy.retentionLabel}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {getSourceNames(policy.sourceIds) || t('common.emptyDash')}
                  </td>
                  <td className="px-4 py-3">
                    <PolicyActiveToggle
                      isActive={policy.isActive}
                      policyName={policy.name}
                      canManage={canManage}
                      onToggle={() => togglePolicyActive(policy.id)}
                    />
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingPolicy(policy)}
                        aria-label={t('common.editAria', { name: policy.name })}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('common.edit')}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <CreatePolicyModal
        isOpen={isCreateOpen}
        sources={sources}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createPolicy}
      />

      <EditPolicyModal
        isOpen={editingPolicy !== null}
        policy={editingPolicy}
        sources={sources}
        onClose={() => setEditingPolicy(null)}
        onSave={updatePolicy}
      />
    </div>
  )
}

interface PolicyCardProps {
  policy: BackupPolicy
  sourceNames: string
  canManage: boolean
  onToggle: () => void
  onEdit: () => void
}

function PolicyCard({ policy, sourceNames, canManage, onToggle, onEdit }: PolicyCardProps) {
  const { t } = useTranslation()

  return (
    <article
      className={[
        'rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900',
        policy.isActive
          ? 'border-slate-200 dark:border-slate-700'
          : 'border-slate-200 opacity-75 dark:border-slate-700',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">{policy.name}</h3>
        {canManage && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('common.editAria', { name: policy.name })}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <PolicyActiveToggle
        isActive={policy.isActive}
        policyName={policy.name}
        canManage={canManage}
        onToggle={onToggle}
      />

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <div>
            <dt className="sr-only">{t('common.frequency')}</dt>
            <dd className="text-slate-700 dark:text-slate-300">{policy.frequencyLabel}</dd>
            <dd className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {t('common.cronPrefix', { value: policy.cronExpression })}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <div>
            <dt className="sr-only">{t('common.retention')}</dt>
            <dd className="text-slate-700 dark:text-slate-300">{policy.retentionLabel}</dd>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <div>
            <dt className="sr-only">{t('common.source')}</dt>
            <dd className="text-slate-700 dark:text-slate-300">
              {sourceNames || t('common.emptyDash')}
            </dd>
          </div>
        </div>
      </dl>
    </article>
  )
}

interface PolicyActiveToggleProps {
  isActive: boolean
  policyName: string
  canManage: boolean
  onToggle: () => void
}

function PolicyActiveToggle({
  isActive,
  policyName,
  canManage,
  onToggle,
}: PolicyActiveToggleProps) {
  const { t } = useTranslation()

  if (!canManage) {
    return (
      <span
        className={[
          'mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
          isActive
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        ].join(' ')}
      >
        {t(`status.policy.${isActive ? 'active' : 'inactive'}`)}
      </span>
    )
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        aria-label={
          isActive
            ? t('common.deactivatePolicyAria', { name: policyName })
            : t('common.activatePolicyAria', { name: policyName })
        }
        onClick={onToggle}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            isActive ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
      <span className="text-xs text-slate-600 dark:text-slate-400">
        {t(`status.policy.${isActive ? 'active' : 'inactive'}`)}
      </span>
    </div>
  )
}
