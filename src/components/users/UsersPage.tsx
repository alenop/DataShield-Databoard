import { useState } from 'react'
import { Shield, ShieldOff, UserPlus } from 'lucide-react'
import type { UsersState } from '../../hooks/useUsers'
import { userRoleLabels, userStatusLabels, type UserRole, type UserStatus } from '../../types/user.types'
import { formatBackupDate } from '../../utils/backupFormatters'
import { InviteUserModal } from './InviteUserModal'

interface UsersPageProps {
  usersState: UsersState
}

export function UsersPage({ usersState }: UsersPageProps) {
  const { users, notification, inviteUser } = usersState
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const handleInvite = (email: string, role: UserRole) => inviteUser({ email, role })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gérez les accès, rôles et l&apos;authentification multi-facteurs (MFA).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Inviter un utilisateur
        </button>
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

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Utilisateurs ({users.length})
        </h2>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Nom
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  E-mail
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Rôle
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  MFA
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Dernière connexion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <UserRoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3">
                    <MfaBadge enabled={user.mfaEnabled} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {user.lastLogin ? formatBackupDate(user.lastLogin) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  )
}

interface UserRoleBadgeProps {
  role: UserRole
}

const roleStyles: Record<UserRole, string> = {
  super_admin: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  backup_operator: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  read_only: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        roleStyles[role],
      ].join(' ')}
    >
      {userRoleLabels[role]}
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
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {userStatusLabels[status]}
    </span>
  )
}

interface MfaBadgeProps {
  enabled: boolean
}

function MfaBadge({ enabled }: MfaBadgeProps) {
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        <Shield className="h-3.5 w-3.5" aria-hidden="true" />
        Activé
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
      <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
      Désactivé
    </span>
  )
}
