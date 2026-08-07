import { act, renderHook } from '@testing-library/react'
import { defaultRoles } from '../data/defaultRoles'
import { currentUser } from '../data/currentUser'
import { ADMIN_DEMO_USER_ID } from '../data/currentUser'
import { USERS_STORAGE_KEY, useUsers } from './useUsers'

describe('useUsers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads default mock users including Admin Demo', () => {
    const { result } = renderHook(() =>
      useUsers({ currentUser, roles: defaultRoles }),
    )

    expect(result.current.users).toHaveLength(4)
    expect(result.current.users.some((user) => user.id === ADMIN_DEMO_USER_ID)).toBe(true)
  })

  it('invites a new user and persists to localStorage', () => {
    const { result } = renderHook(() =>
      useUsers({ currentUser, roles: defaultRoles }),
    )
    const initialCount = result.current.users.length

    act(() => {
      const error = result.current.inviteUser({
        email: 'new.user@entreprise.com',
        roleId: 'read_only',
      })
      expect(error).toBeNull()
    })

    expect(result.current.users).toHaveLength(initialCount + 1)
    const lastUser = result.current.users[result.current.users.length - 1]
    expect(lastUser?.status).toBe('inactive')
    expect(result.current.notification?.message).toContain('Invitation envoyée')

    const stored = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) ?? '[]')
    expect(stored.some((user: { email: string }) => user.email === 'new.user@entreprise.com')).toBe(
      true,
    )
  })

  it('assigns a role to a manageable user', () => {
    const { result } = renderHook(() =>
      useUsers({ currentUser, roles: defaultRoles }),
    )

    act(() => {
      const error = result.current.assignUserRole(
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
        'read_only',
      )
      expect(error).toBeNull()
    })

    const updated = result.current.users.find(
      (user) => user.id === 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    )
    expect(updated?.roleId).toBe('read_only')
  })

  it('prevents admin from assigning role to super admin', () => {
    const adminActor = {
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      name: 'Sophie Martin',
      email: 'admin@entreprise.com',
      roleId: 'admin',
    }

    const { result } = renderHook(() =>
      useUsers({ currentUser: adminActor, roles: defaultRoles }),
    )

    act(() => {
      const error = result.current.assignUserRole(ADMIN_DEMO_USER_ID, 'read_only')
      expect(error).not.toBeNull()
    })
  })

  it('toggles user status when permitted', () => {
    const { result } = renderHook(() =>
      useUsers({ currentUser, roles: defaultRoles }),
    )

    act(() => {
      const error = result.current.toggleUserStatus(
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
      )
      expect(error).toBeNull()
    })

    const updated = result.current.users.find(
      (user) => user.id === 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    )
    expect(updated?.status).toBe('inactive')
  })
})
