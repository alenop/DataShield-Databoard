import { useCallback, useEffect, useState } from 'react'
import { mockUsers } from '../data/mockUsers'
import type { InviteUserInput, User } from '../types/user.types'
import { createInvitedUser, parseStoredUsers, validateInviteUserInput } from '../utils/user.utils'

export const USERS_STORAGE_KEY = 'datashield-users'

export function loadUsers(): User[] {
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  return parseStoredUsers(stored, mockUsers)
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>(loadUsers)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  const inviteUser = useCallback(
    (input: InviteUserInput): string | null => {
      const error = validateInviteUserInput(
        input,
        users.map((user) => user.email),
      )
      if (error) return error

      const invited = createInvitedUser(input)
      setUsers((prev) => [...prev, invited])
      setNotification({
        message: `Invitation envoyée à ${invited.email}.`,
        type: 'success',
      })
      return null
    },
    [users],
  )

  return {
    users,
    notification,
    inviteUser,
  }
}

export type UsersState = ReturnType<typeof useUsers>
