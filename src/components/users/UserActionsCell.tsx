import { useTranslation } from 'react-i18next'
import type { UsersState } from '../../hooks/useUsers'
import type { RoleDefinition } from '../../types/role.types'
import type { User } from '../../types/user.types'

interface UserActionsCellProps {
  user: User
  usersState: UsersState
  roles: RoleDefinition[]
  isCurrentUser: boolean
}

export function UserActionsCell({
  user,
  usersState,
  roles,
  isCurrentUser,
}: UserActionsCellProps) {
  const { t } = useTranslation()
  const { assignableRoles, assignUserRole, toggleUserStatus, canManageUser } = usersState
  const permissions = canManageUser(user)
  const roleName = roles.find((role) => role.id === user.roleId)?.name ?? user.roleId

  if (isCurrentUser) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500">
        {t('common.youWithRole', { role: roleName })}
      </span>
    )
  }

  if (!permissions.canAssignRole && !permissions.canToggleStatus) {
    return (
      <span
        className="text-xs text-slate-400 dark:text-slate-500"
        title={t('common.insufficientPermission')}
      >
        {t('common.notEditable')}
      </span>
    )
  }

  const toggleAction = user.status === 'active' ? t('common.deactivate') : t('common.activate')

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {permissions.canAssignRole && (
        <select
          value={user.roleId}
          onChange={(event) => assignUserRole(user.id, event.target.value)}
          aria-label={t('common.userRoleAria', { name: user.name })}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          {assignableRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      )}

      {permissions.canToggleStatus && (
        <button
          type="button"
          role="switch"
          aria-checked={user.status === 'active'}
          aria-label={t('common.toggleUserAria', { action: toggleAction, name: user.name })}
          onClick={() => toggleUserStatus(user.id)}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
            user.status === 'active'
              ? 'bg-emerald-500'
              : 'bg-slate-300 dark:bg-slate-600',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              user.status === 'active' ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
          <span className="sr-only">{t(`status.user.${user.status}`)}</span>
        </button>
      )}
    </div>
  )
}
