import { defaultRoles } from '../data/defaultRoles'
import type { User } from '../types/user.types'
import {
  canAssignRoleToUser,
  canCreateRole,
  canEditRole,
  canManagePolicies,
  canManageTargetUser,
  canToggleUserStatus,
  canViewPolicies,
  getAssignableRoles,
} from './userPermissions.utils'

const superAdminId = 'actor-super'
const adminId = 'actor-admin'

const superAdminUser: User = {
  id: superAdminId,
  name: 'Super',
  email: 'super@test.com',
  roleId: 'super_admin',
  status: 'active',
  lastLogin: null,
  mfaEnabled: true,
}

const adminUser: User = {
  id: adminId,
  name: 'Admin',
  email: 'admin@test.com',
  roleId: 'admin',
  status: 'active',
  lastLogin: null,
  mfaEnabled: true,
}

const operatorUser: User = {
  id: 'operator-1',
  name: 'Operator',
  email: 'op@test.com',
  roleId: 'backup_operator',
  status: 'active',
  lastLogin: null,
  mfaEnabled: false,
}

describe('userPermissions.utils', () => {
  it('allows super admin to manage lower-ranked users', () => {
    expect(
      canManageTargetUser(superAdminId, 'super_admin', operatorUser, defaultRoles),
    ).toBe(true)
  })

  it('prevents admin from managing super admin or peers', () => {
    expect(
      canManageTargetUser(adminId, 'admin', superAdminUser, defaultRoles),
    ).toBe(false)
    expect(
      canManageTargetUser(adminId, 'admin', adminUser, defaultRoles),
    ).toBe(false)
  })

  it('prevents assigning super_admin role as admin', () => {
    expect(
      canAssignRoleToUser(
        adminId,
        'admin',
        operatorUser,
        'super_admin',
        defaultRoles,
      ),
    ).toBe(false)
  })

  it('allows admin to assign backup_operator role', () => {
    expect(
      canAssignRoleToUser(
        adminId,
        'admin',
        operatorUser,
        'read_only',
        defaultRoles,
      ),
    ).toBe(true)
  })

  it('allows super admin to toggle operator status', () => {
    expect(
      canToggleUserStatus(superAdminId, 'super_admin', operatorUser, defaultRoles),
    ).toBe(true)
  })

  it('prevents admin from toggling super admin status', () => {
    expect(
      canToggleUserStatus(adminId, 'admin', superAdminUser, defaultRoles),
    ).toBe(false)
  })

  it('returns assignable roles below actor rank', () => {
    const assignable = getAssignableRoles('admin', defaultRoles)
    expect(assignable.map((role) => role.id)).toEqual([
      'backup_operator',
      'read_only',
    ])
  })

  it('allows super admin to create and edit roles', () => {
    expect(canCreateRole('super_admin', defaultRoles)).toBe(true)
    expect(canEditRole('super_admin', defaultRoles[1], defaultRoles)).toBe(true)
    expect(canEditRole('super_admin', defaultRoles[0], defaultRoles)).toBe(false)
  })

  it('prevents admin from creating or editing roles', () => {
    expect(canCreateRole('admin', defaultRoles)).toBe(false)
    expect(canEditRole('admin', defaultRoles[2], defaultRoles)).toBe(false)
  })

  it('grants policy management to super admin and admin only', () => {
    expect(canManagePolicies('super_admin', defaultRoles)).toBe(true)
    expect(canManagePolicies('admin', defaultRoles)).toBe(true)
    expect(canViewPolicies('backup_operator', defaultRoles)).toBe(true)
    expect(canManagePolicies('backup_operator', defaultRoles)).toBe(false)
    expect(canViewPolicies('read_only', defaultRoles)).toBe(true)
    expect(canManagePolicies('read_only', defaultRoles)).toBe(false)
  })
})
