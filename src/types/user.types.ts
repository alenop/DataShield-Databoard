export type UserRole = 'super_admin' | 'backup_operator' | 'read_only'

export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: string | null
  mfaEnabled: boolean
}

export interface InviteUserInput {
  email: string
  role: UserRole
}

export const userRoleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  backup_operator: 'Backup Operator',
  read_only: 'Read Only',
}

export const userStatusLabels: Record<UserStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
}

export const USER_ROLES: UserRole[] = ['super_admin', 'backup_operator', 'read_only']
