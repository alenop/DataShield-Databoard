export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  name: string
  email: string
  roleId: string
  status: UserStatus
  lastLogin: string | null
  mfaEnabled: boolean
}

export interface InviteUserInput {
  email: string
  roleId: string
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  roleId: string
}

export const userStatusLabels: Record<UserStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
}
