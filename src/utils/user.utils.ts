import type { InviteUserInput, User } from '../types/user.types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LegacyUserRecord extends Partial<User> {
  role?: string
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim())
}

export function validateInviteUserInput(
  input: InviteUserInput,
  existingEmails: string[],
): string | null {
  const email = input.email.trim().toLowerCase()

  if (!email) return "L'adresse e-mail est requise."
  if (!isValidEmail(email)) return 'Adresse e-mail invalide.'
  if (!input.roleId.trim()) return 'Le rôle est requis.'

  if (existingEmails.some((existing) => existing.toLowerCase() === email)) {
    return 'Un utilisateur avec cet e-mail existe déjà.'
  }

  return null
}

export function generateUserId(): string {
  return crypto.randomUUID()
}

export function deriveNameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? 'Utilisateur'
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function createInvitedUser(input: InviteUserInput): User {
  const email = input.email.trim().toLowerCase()

  return {
    id: generateUserId(),
    name: deriveNameFromEmail(email),
    email,
    roleId: input.roleId,
    status: 'inactive',
    lastLogin: null,
    mfaEnabled: false,
  }
}

export function parseStoredUsers(stored: string | null, fallback: User[]): User[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map(normalizeUser)
      .filter((user): user is User => user !== null)

    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

export function ensureAdminDemoInUsers(users: User[], fallback: User[]): User[] {
  const adminDemo = fallback.find((user) => user.id === fallback[0]?.id) ?? fallback[0]
  if (!adminDemo) return users

  const hasAdminDemo = users.some((user) => user.id === adminDemo.id)
  if (hasAdminDemo) return users

  return [adminDemo, ...users]
}

function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as LegacyUserRecord
  const email = record.email?.trim().toLowerCase()
  const name = record.name?.trim()
  const roleId = record.roleId?.trim() ?? record.role?.trim()

  if (!email || !name || !roleId) return null

  const status = record.status === 'inactive' ? 'inactive' : 'active'

  return {
    id: record.id?.trim() || generateUserId(),
    name,
    email,
    roleId,
    status,
    lastLogin: typeof record.lastLogin === 'string' ? record.lastLogin : null,
    mfaEnabled: Boolean(record.mfaEnabled),
  }
}
