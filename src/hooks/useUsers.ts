import { useCallback, useEffect, useState } from 'react'
import i18n from '../i18n'
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
import type { AuditLogger } from '../utils/auditLogger.utils'

export const USERS_STORAGE_KEY = 'datashield-users'

export function loadUsers(): User[] {
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  const parsed = parseStoredUsers(stored, mockUsers)
  return ensureAdminDemoInUsers(parsed, mockUsers)
}

interface UseUsersOptions {
  currentUser: CurrentUser
  roles: RoleDefinition[]
  logAudit?: AuditLogger
}

export function useUsers({ currentUser, roles, logAudit }: UseUsersOptions) {
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
        return i18n.t('notifications.inviteForbidden')
      }

      const error = validateInviteUserInput(
        input,
        users.map((user) => user.email),
      )
      if (error) return error

      const invited = createInvitedUser(input)
      setUsers((prev) => [...prev, invited])
      logAudit?.({
        actionCode: 'USER_INVITED',
        status: 'success',
        metadata: { email: invited.email },
      })
      setNotification({
        message: i18n.t('notifications.inviteSent', { email: invited.email }),
        type: 'success',
      })
      return null
    },
    [users, currentUser.roleId, roles, logAudit],
  )

  const assignUserRole = useCallback(
    (userId: string, roleId: string): string | null => {
      const targetUser = users.find((user) => user.id === userId)
      if (!targetUser) return i18n.t('notifications.userNotFound')

      if (
        !canAssignRoleToUser(
          currentUser.id,
          currentUser.roleId,
          targetUser,
          roleId,
          roles,
        )
      ) {
        logAudit?.({
          actionCode: 'USER_ROLE_CHANGED',
          status: 'denied',
          metadata: { name: targetUser.name, role: roleId },
        })
        return i18n.t('notifications.assignRoleForbidden')
      }

      if (targetUser.roleId === roleId) return null

      const roleName = roles.find((role) => role.id === roleId)?.name ?? roleId
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, roleId } : user)),
      )
      logAudit?.({
        actionCode: 'USER_ROLE_CHANGED',
        status: 'success',
        metadata: { name: targetUser.name, role: roleName },
      })
      setNotification({
        message: i18n.t('notifications.roleAssigned', { role: roleName, name: targetUser.name }),
        type: 'success',
      })
      return null
    },
    [users, currentUser, roles, logAudit],
  )

  const toggleUserStatus = useCallback(
    (userId: string): string | null => {
      const targetUser = users.find((user) => user.id === userId)
      if (!targetUser) return i18n.t('notifications.userNotFound')

      if (!canToggleUserStatus(currentUser.id, currentUser.roleId, targetUser, roles)) {
        return i18n.t('notifications.toggleStatusForbidden')
      }

      const nextStatus: UserStatus =
        targetUser.status === 'active' ? 'inactive' : 'active'

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: nextStatus } : user,
        ),
      )
      setNotification({
        message: i18n.t('notifications.userStatusChanged', {
          name: targetUser.name,
          status: i18n.t(
            nextStatus === 'active'
              ? 'notifications.userStatusActive'
              : 'notifications.userStatusInactive',
          ),
        }),
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
