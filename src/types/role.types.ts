export type Permission =
  | 'users.invite'
  | 'users.assign_role'
  | 'users.toggle_status'
  | 'roles.create'
  | 'roles.edit'
  | 'policies.view'
  | 'policies.manage'
  | 'backups.manage'
  | 'sources.manage'
  | 'audit.view'
  | 'settings.manage'
  | 'secrets.manage'

export interface RoleDefinition {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem: boolean
  rank: number
}

export const ALL_PERMISSIONS: Permission[] = [
  'users.invite',
  'users.assign_role',
  'users.toggle_status',
  'roles.create',
  'roles.edit',
  'policies.view',
  'policies.manage',
  'backups.manage',
  'sources.manage',
  'audit.view',
  'settings.manage',
  'secrets.manage',
]

export const SUPER_ADMIN_ONLY_PERMISSIONS: Permission[] = ['secrets.manage']

export function getEditablePermissions(roleId: string): Permission[] {
  if (roleId === 'super_admin') return ALL_PERMISSIONS

  return ALL_PERMISSIONS.filter(
    (permission) => !SUPER_ADMIN_ONLY_PERMISSIONS.includes(permission),
  )
}

export function sanitizeRolePermissions(
  roleId: string,
  permissions: Permission[],
): Permission[] {
  if (roleId === 'super_admin') return permissions

  return permissions.filter(
    (permission) => !SUPER_ADMIN_ONLY_PERMISSIONS.includes(permission),
  )
}

export const permissionLabels: Record<Permission, string> = {
  'users.invite': 'Inviter des utilisateurs',
  'users.assign_role': 'Attribuer des rôles',
  'users.toggle_status': 'Activer / désactiver des utilisateurs',
  'roles.create': 'Créer des rôles',
  'roles.edit': 'Modifier les droits des rôles',
  'policies.view': 'Consulter les politiques de sauvegarde',
  'policies.manage': 'Gérer les politiques de sauvegarde',
  'backups.manage': 'Gérer les sauvegardes',
  'sources.manage': 'Gérer les sources',
  'audit.view': "Consulter le journal d'audit",
  'settings.manage': 'Gérer les paramètres',
  'secrets.manage': 'Gérer les secrets et l\'authentification',
}

export const CUSTOM_ROLE_RANK = 35
