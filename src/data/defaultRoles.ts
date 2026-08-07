import type { RoleDefinition } from '../types/role.types'

export const defaultRoles: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Accès complet à la plateforme, gestion des rôles et des droits.',
    permissions: [
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
    ],
    isSystem: true,
    rank: 100,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Gestion des utilisateurs et des politiques de sauvegarde.',
    permissions: [
      'users.invite',
      'users.assign_role',
      'users.toggle_status',
      'policies.view',
      'policies.manage',
      'backups.manage',
      'sources.manage',
      'audit.view',
    ],
    isSystem: true,
    rank: 50,
  },
  {
    id: 'backup_operator',
    name: 'Backup Operator',
    description: 'Exécution et supervision des sauvegardes.',
    permissions: ['policies.view', 'backups.manage', 'sources.manage'],
    isSystem: true,
    rank: 20,
  },
  {
    id: 'read_only',
    name: 'Read Only',
    description: 'Consultation en lecture seule.',
    permissions: ['policies.view', 'audit.view'],
    isSystem: true,
    rank: 10,
  },
]

export const SYSTEM_ROLE_IDS = defaultRoles.map((role) => role.id)
