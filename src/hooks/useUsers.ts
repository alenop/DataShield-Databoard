import { useCallback, useEffect, useState } from 'react'
import { mockUsers } from '../data/mockUsers'
import type { CurrentUser, InviteUserInput, User, UserStatus } from '../types/user.types'
import type { RoleDefinition } from '../types/role.types'
import {
  canAssignRoleToUser,
  canInviteUsers,
  canManageTargetUser,
  canToggleUserStatus,
  getAssignableRoles,
} from '../utils/userPermissions.utils'
import {
  createInvitedUser,
  ensureAdminDemoInUsers,
  parseStoredUsers,
  validateInviteUserInput,
} from '../utils/user.utils'

export const USERS_STORAGE_KEY = 'datashield-users'

export function loadUsers(): User[] {
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  const parsed = parseStoredUsers(stored, mockUsers)
  return ensureAdminDemoInUsers(parsed, mockUsers)
}

interface UseUsersOptions {
  currentUser: CurrentUser
  roles: RoleDefinition[]
}

export function useUsers({ currentUser, roles }: UseUsersOptions) {
  const [users, setUsers] = useState<User[]>(loadUsers)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  const assignableRoles = getAssignableRoles(currentUser.roleId, roles)

  const inviteUser = useCallback(
    (input: InviteUserInput): string | null => {
      if (!canInviteUsers(currentUser.roleId, roles)) {
        return "Vous n'avez pas l'autorisation d'inviter des utilisateurs."
      }

      const error = validateInviteUserInput(
        input,
        users.map((user) => user.email),
      )
      if (error) return error

      const invited = createInvitedUser(input)
      setUsers((prev) => [...prev, invited])
      setNotification({
        message: `Invitation envoyée à ${invited.email}.`,
        type: 'success',
      })
      return null
    },
    [users, currentUser.roleId, roles],
  )

  const assignUserRole = useCallback(
    (userId: string, roleId: string): string | null => {
      const targetUser = users.find((user) => user.id === userId)
      if (!targetUser) return 'Utilisateur introuvable.'

      if (
        !canAssignRoleToUser(
          currentUser.id,
          currentUser.roleId,
          targetUser,
          roleId,
          roles,
        )
      ) {
        return "Vous n'avez pas l'autorisation d'attribuer ce rôle à cet utilisateur."
      }

      if (targetUser.roleId === roleId) return null

      const roleName = roles.find((role) => role.id === roleId)?.name ?? roleId
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, roleId } : user)),
      )
      setNotification({
        message: `Rôle « ${roleName} » attribué à ${targetUser.name}.`,
        type: 'success',
      })
      return null
    },
    [users, currentUser, roles],
  )

  const toggleUserStatus = useCallback(
    (userId: string): string | null => {
      const targetUser = users.find((user) => user.id === userId)
      if (!targetUser) return 'Utilisateur introuvable.'

      if (!canToggleUserStatus(currentUser.id, currentUser.roleId, targetUser, roles)) {
        return "Vous n'avez pas l'autorisation de modifier le statut de cet utilisateur."
      }

      const nextStatus: UserStatus =
        targetUser.status === 'active' ? 'inactive' : 'active'

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: nextStatus } : user,
        ),
      )
      setNotification({
        message: `${targetUser.name} est maintenant ${nextStatus === 'active' ? 'actif' : 'inactif'}.`,
        type: 'success',
      })
      return null
    },
    [users, currentUser, roles],
  )

  const canManageUser = useCallback(
    (targetUser: User) => ({
      canAssignRole:
        assignableRoles.length > 0 &&
        canManageTargetUser(currentUser.id, currentUser.roleId, targetUser, roles),
      canToggleStatus: canToggleUserStatus(
        currentUser.id,
        currentUser.roleId,
        targetUser,
        roles,
      ),
    }),
    [currentUser, roles, assignableRoles.length],
  )

  return {
    users,
    notification,
    assignableRoles,
    inviteUser,
    assignUserRole,
    toggleUserStatus,
    canManageUser,
    canInvite: canInviteUsers(currentUser.roleId, roles),
  }
}

export type UsersState = ReturnType<typeof useUsers>
