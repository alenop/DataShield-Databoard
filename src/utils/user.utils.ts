import type { InviteUserInput, User, UserRole } from '../types/user.types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    role: input.role,
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

function isUserRole(value: string): value is UserRole {
  return value === 'super_admin' || value === 'backup_operator' || value === 'read_only'
}

function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<User>
  const email = record.email?.trim().toLowerCase()
  const name = record.name?.trim()
  const role = record.role

  if (!email || !name || !role || !isUserRole(role)) return null

  const status = record.status === 'inactive' ? 'inactive' : 'active'

  return {
    id: record.id?.trim() || generateUserId(),
    name,
    email,
    role,
    status,
    lastLogin: typeof record.lastLogin === 'string' ? record.lastLogin : null,
    mfaEnabled: Boolean(record.mfaEnabled),
  }
}
