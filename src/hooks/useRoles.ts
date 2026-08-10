import { useCallback, useEffect, useState } from 'react'
import i18n from '../i18n'
import { defaultRoles } from '../data/defaultRoles'
import type { Permission, RoleDefinition } from '../types/role.types'
import {
  createCustomRole,
  mergeRolesWithDefaults,
  parseStoredRoles,
  validateRoleName,
  validateRolePermissions,
} from '../utils/role.utils'
import { canEditRole } from '../utils/userPermissions.utils'

export const ROLES_STORAGE_KEY = 'datashield-roles'

export function loadRoles(): RoleDefinition[] {
  const stored = localStorage.getItem(ROLES_STORAGE_KEY)
  const parsed = parseStoredRoles(stored, defaultRoles)
  return mergeRolesWithDefaults(parsed)
}

export function useRoles(currentUserRoleId: string) {
  const [roles, setRoles] = useState<RoleDefinition[]>(loadRoles)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles))
  }, [roles])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  const createRole = useCallback(
    (input: {
      name: string
      description: string
      permissions: Permission[]
    }): string | null => {
      const nameError = validateRoleName(input.name, roles)
      if (nameError) return nameError

      const permissionsError = validateRolePermissions(input.permissions)
      if (permissionsError) return permissionsError

      const role = createCustomRole(input)
      setRoles((prev) => [...prev, role])
      setNotification({
        message: i18n.t('notifications.roleCreated', { name: role.name }),
        type: 'success',
      })
      return null
    },
    [roles],
  )

  const updateRolePermissions = useCallback(
    (roleId: string, permissions: Permission[]): string | null => {
      const targetRole = roles.find((role) => role.id === roleId)
      if (!targetRole) return i18n.t('notifications.roleNotFound')
      if (!canEditRole(currentUserRoleId, targetRole, roles)) {
        return i18n.t('notifications.roleEditForbidden')
      }

      const permissionsError = validateRolePermissions(permissions)
      if (permissionsError) return permissionsError

      setRoles((prev) =>
        prev.map((role) => (role.id === roleId ? { ...role, permissions } : role)),
      )
      setNotification({
        message: i18n.t('notifications.roleUpdated', { name: targetRole.name }),
        type: 'success',
      })
      return null
    },
    [roles, currentUserRoleId],
  )

  const getRoleById = useCallback(
    (roleId: string) => roles.find((role) => role.id === roleId),
    [roles],
  )

  return {
    roles,
    notification,
    createRole,
    updateRolePermissions,
    getRoleById,
  }
}

export type RolesState = ReturnType<typeof useRoles>
