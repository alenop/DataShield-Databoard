import { useState } from 'react'
import { Shield, ShieldOff, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DemoCurrentUser } from '../../types/demoScenario.types'
import type { RolesState } from '../../hooks/useRoles'
import type { UsersState } from '../../hooks/useUsers'
import type { RoleDefinition } from '../../types/role.types'
import type { UserStatus } from '../../types/user.types'
import { formatBackupDate } from '../../utils/backupFormatters'
import { InviteUserModal } from './InviteUserModal'
import { RoleCapabilitiesPanel } from './RoleCapabilitiesPanel'
import { RolesSection } from './RolesSection'
import { UserActionsCell } from './UserActionsCell'

interface UsersPageProps {
  usersState: UsersState
  rolesState: RolesState
  currentUser: DemoCurrentUser
}

export function UsersPage({ usersState, rolesState, currentUser }: UsersPageProps) {
  const { t } = useTranslation()
  const {
    users,
    notification,
    assignableRoles,
    inviteUser,
    canInvite,
  } = usersState
  const { roles, getRoleById } = rolesState
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const currentUserRole = getRoleById(currentUser.roleId)

  const handleInvite = (email: string, roleId: string) => inviteUser({ email, roleId })

  const notifications = [notification, rolesState.notification].filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('pages.users.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('common.loggedInAs', {
              name: currentUser.name,
              role: currentUserRole?.name ?? currentUser.roleId,
            })}
          </p>
        </div>

        {canInvite && (
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {t('pages.users.inviteUser')}
          </button>
        )}
      </div>

      {notifications.map((item, index) =>
        item ? (
          <div
            key={index}
            role="status"
            className={[
              'rounded-lg border px-4 py-3 text-sm',
              item.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
            ].join(' ')}
          >
            {item.message}
          </div>
        ) : null,
      )}

      <RolesSection rolesState={rolesState} currentUserRoleId={currentUser.roleId} />

      <RoleCapabilitiesPanel rolesState={rolesState} />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('common.countWithLabel', { label: t('pages.users.usersSection'), count: users.length })}
        </h2>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.name')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.email')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.role')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.status')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.mfa')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.lastLogin')}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {users.map((user) => {
                const role = getRoleById(user.roleId)
                const isCurrentUser = user.id === currentUser.id

                return (
                  <tr
                    key={user.id}
                    className={[
                      'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-950/20' : '',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {user.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                          ({t('common.you')})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <UserRoleBadge role={role} roleId={user.roleId} />
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3">
                      <MfaBadge enabled={user.mfaEnabled} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {user.lastLogin ? formatBackupDate(user.lastLogin) : t('common.emptyDash')}
                    </td>
                    <td className="px-4 py-3">
                      <UserActionsCell
                        user={user}
                        usersState={usersState}
                        roles={roles}
                        isCurrentUser={isCurrentUser}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        assignableRoles={assignableRoles}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  )
}

interface UserRoleBadgeProps {
  role: RoleDefinition | undefined
  roleId: string
}

const systemRoleStyles: Record<string, string> = {
  super_admin: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  backup_operator: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  read_only: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

function UserRoleBadge({ role, roleId }: UserRoleBadgeProps) {
  const style =
    systemRoleStyles[roleId] ??
    'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        style,
      ].join(' ')}
    >
      {role?.name ?? roleId}
    </span>
  )
}

interface UserStatusBadgeProps {
  status: UserStatus
}

const statusStyles: Record<UserStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {t(`status.user.${status}`)}
    </span>
  )
}

interface MfaBadgeProps {
  enabled: boolean
}

function MfaBadge({ enabled }: MfaBadgeProps) {
  const { t } = useTranslation()

  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        <Shield className="h-3.5 w-3.5" aria-hidden="true" />
        {t('common.enabled')}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
      <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
      {t('common.disabled')}
    </span>
  )
}
