import { act, renderHook } from '@testing-library/react'
import { USERS_STORAGE_KEY, useUsers } from './useUsers'

describe('useUsers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads default mock users', () => {
    const { result } = renderHook(() => useUsers())

    expect(result.current.users).toHaveLength(3)
    expect(result.current.users.some((user) => user.email === 'admin@entreprise.com')).toBe(true)
  })

  it('invites a new user and persists to localStorage', () => {
    const { result } = renderHook(() => useUsers())
    const initialCount = result.current.users.length

    act(() => {
      const error = result.current.inviteUser({
        email: 'new.user@entreprise.com',
        role: 'read_only',
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

  it('returns validation error for duplicate email', () => {
    const { result } = renderHook(() => useUsers())

    act(() => {
      const error = result.current.inviteUser({
        email: 'admin@entreprise.com',
        role: 'backup_operator',
      })
      expect(error).not.toBeNull()
    })

    expect(result.current.users).toHaveLength(3)
  })
})
