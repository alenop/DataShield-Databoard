import { defaultRoles } from '../data/defaultRoles'
import type { RoleDefinition } from '../types/role.types'
import { mergeRolesWithDefaults } from './role.utils'

describe('mergeRolesWithDefaults', () => {
  it('adds new default permissions to stored system roles', () => {
    const storedSuperAdmin: RoleDefinition = {
      ...defaultRoles[0],
      permissions: [
        'users.invite',
        'users.assign_role',
        'users.toggle_status',
        'roles.create',
        'roles.edit',
        'backups.manage',
        'sources.manage',
        'audit.view',
        'settings.manage',
      ],
    }

    const merged = mergeRolesWithDefaults([storedSuperAdmin])
    const superAdmin = merged.find((role) => role.id === 'super_admin')

    expect(superAdmin?.permissions).toContain('policies.view')
    expect(superAdmin?.permissions).toContain('policies.manage')
  })
})
