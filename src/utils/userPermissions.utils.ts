import type { User } from '../types/user.types'
import type { Permission, RoleDefinition } from '../types/role.types'

export function getRoleById(
  roles: RoleDefinition[],
  roleId: string,
): RoleDefinition | undefined {
  return roles.find((role) => role.id === roleId)
}

export function actorHasPermission(
  actorRoleId: string,
  permission: Permission,
  roles: RoleDefinition[],
): boolean {
  const role = getRoleById(roles, actorRoleId)
  return role?.permissions.includes(permission) ?? false
}

export function canManageTargetUser(
  actorUserId: string,
  actorRoleId: string,
  targetUser: User,
  roles: RoleDefinition[],
): boolean {
  if (actorUserId === targetUser.id) return false

  const actorRole = getRoleById(roles, actorRoleId)
  const targetRole = getRoleById(roles, targetUser.roleId)
  if (!actorRole || !targetRole) return false

  return actorRole.rank > targetRole.rank
}

export function canAssignRoleToUser(
  actorUserId: string,
  actorRoleId: string,
  targetUser: User,
  newRoleId: string,
  roles: RoleDefinition[],
): boolean {
  if (!actorHasPermission(actorRoleId, 'users.assign_role', roles)) return false
  if (!canManageTargetUser(actorUserId, actorRoleId, targetUser, roles)) return false

  const actorRole = getRoleById(roles, actorRoleId)
  const newRole = getRoleById(roles, newRoleId)
  if (!actorRole || !newRole) return false

  return newRole.rank < actorRole.rank
}

export function canToggleUserStatus(
  actorUserId: string,
  actorRoleId: string,
  targetUser: User,
  roles: RoleDefinition[],
): boolean {
  if (!actorHasPermission(actorRoleId, 'users.toggle_status', roles)) return false
  return canManageTargetUser(actorUserId, actorRoleId, targetUser, roles)
}

export function canInviteUsers(actorRoleId: string, roles: RoleDefinition[]): boolean {
  return actorHasPermission(actorRoleId, 'users.invite', roles)
}

export function canCreateRole(actorRoleId: string, roles: RoleDefinition[]): boolean {
  return actorHasPermission(actorRoleId, 'roles.create', roles)
}

export function canEditRole(
  actorRoleId: string,
  targetRole: RoleDefinition,
  roles: RoleDefinition[],
): boolean {
  if (!actorHasPermission(actorRoleId, 'roles.edit', roles)) return false
  if (targetRole.id === 'super_admin') return false

  const actorRole = getRoleById(roles, actorRoleId)
  if (!actorRole) return false

  if (targetRole.isSystem) {
    return actorRole.rank > targetRole.rank
  }

  return true
}

export function getAssignableRoles(
  actorRoleId: string,
  roles: RoleDefinition[],
): RoleDefinition[] {
  const actorRole = getRoleById(roles, actorRoleId)
  if (!actorRole || !actorHasPermission(actorRoleId, 'users.assign_role', roles)) {
    return []
  }

  return roles.filter((role) => role.rank < actorRole.rank)
}

export function canViewPolicies(actorRoleId: string, roles: RoleDefinition[]): boolean {
  return actorHasPermission(actorRoleId, 'policies.view', roles)
}

export function canManagePolicies(actorRoleId: string, roles: RoleDefinition[]): boolean {
  return actorHasPermission(actorRoleId, 'policies.manage', roles)
}

export function canManageSecrets(actorRoleId: string, roles: RoleDefinition[]): boolean {
  return actorHasPermission(actorRoleId, 'secrets.manage', roles)
}
