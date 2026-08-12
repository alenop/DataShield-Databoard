import { useMemo, useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RolesState } from '../../hooks/useRoles'
import type { Permission, RoleDefinition } from '../../types/role.types'

interface RoleCapabilitiesPanelProps {
  rolesState: RolesState
}

const systemRoleStyles: Record<string, string> = {
  super_admin: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  backup_operator: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  read_only: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export function RoleCapabilitiesPanel({ rolesState }: RoleCapabilitiesPanelProps) {
  const { t } = useTranslation()
  const { roles } = rolesState
  const [isOpen, setIsOpen] = useState(false)

  const sortedRoles = useMemo(
    () => [...roles].sort((left, right) => right.rank - left.rank),
    [roles],
  )

  const permissionLabel = (permission: Permission) =>
    t(`pages.users.permissions.${permission}`)

  const getRoleSummary = (role: RoleDefinition) => {
    const translated = t(`pages.users.roleGuide.roles.${role.id}`, { defaultValue: '' })
    return translated || role.description
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 px-6 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-base font-semibold text-slate-900 dark:text-white">
            {t('pages.users.roleGuide.title')}
          </span>
          <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
            {t('pages.users.roleGuide.hint')}
          </span>
        </span>
        <ChevronDown
          className={[
            'mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          {sortedRoles.map((role) => (
            <RoleCapabilityCard
              key={role.id}
              role={role}
              summary={getRoleSummary(role)}
              permissionLabel={permissionLabel}
            />
          ))}
        </div>
      )}
    </section>
  )
}

interface RoleCapabilityCardProps {
  role: RoleDefinition
  summary: string
  permissionLabel: (permission: Permission) => string
}

function RoleCapabilityCard({ role, summary, permissionLabel }: RoleCapabilityCardProps) {
  const { t } = useTranslation()
  const style =
    systemRoleStyles[role.id] ??
    'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{role.name}</h3>
        <span className={['inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', style].join(' ')}>
          {role.isSystem ? t('common.system') : t('common.custom')}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{summary}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t('pages.users.roleGuide.capabilitiesLabel')}
      </p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {role.permissions.map((permission) => (
          <li
            key={permission}
            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
            {permissionLabel(permission)}
          </li>
        ))}
      </ul>
    </article>
  )
}
