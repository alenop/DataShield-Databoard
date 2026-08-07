import {
  createInvitedUser,
  deriveNameFromEmail,
  isValidEmail,
  validateInviteUserInput,
} from './user.utils'

describe('user.utils', () => {
  it('validates email format', () => {
    expect(isValidEmail('admin@entreprise.com')).toBe(true)
    expect(isValidEmail('invalid')).toBe(false)
  })

  it('rejects duplicate emails on invite', () => {
    const error = validateInviteUserInput(
      { email: 'admin@entreprise.com', roleId: 'read_only' },
      ['admin@entreprise.com'],
    )
    expect(error).toContain('existe déjà')
  })

  it('derives a display name from email', () => {
    expect(deriveNameFromEmail('new.user@entreprise.com')).toBe('New User')
  })

  it('creates an invited user as inactive without MFA', () => {
    const user = createInvitedUser({
      email: 'invite@entreprise.com',
      roleId: 'backup_operator',
    })

    expect(user.email).toBe('invite@entreprise.com')
    expect(user.status).toBe('inactive')
    expect(user.mfaEnabled).toBe(false)
    expect(user.lastLogin).toBeNull()
  })
})
