import { act, renderHook } from '@testing-library/react'
import { ROLES_STORAGE_KEY, useRoles } from './useRoles'

describe('useRoles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates a custom role', () => {
    const { result } = renderHook(() => useRoles('super_admin'))

    act(() => {
      const error = result.current.createRole({
        name: 'Compliance Officer',
        description: 'Audit and compliance',
        permissions: ['audit.view', 'users.invite'],
      })
      expect(error).toBeNull()
    })

    expect(result.current.roles.some((role) => role.name === 'Compliance Officer')).toBe(true)

    const stored = JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) ?? '[]')
    expect(stored.some((role: { name: string }) => role.name === 'Compliance Officer')).toBe(true)
  })

  it('updates permissions on an editable role', () => {
    const { result } = renderHook(() => useRoles('super_admin'))

    act(() => {
      const error = result.current.updateRolePermissions('admin', ['users.invite'])
      expect(error).toBeNull()
    })

    const adminRole = result.current.roles.find((role) => role.id === 'admin')
    expect(adminRole?.permissions).toEqual(['users.invite'])
  })
})
