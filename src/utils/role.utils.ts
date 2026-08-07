import { defaultRoles } from '../data/defaultRoles'
import type { Permission, RoleDefinition } from '../types/role.types'
import { ALL_PERMISSIONS, CUSTOM_ROLE_RANK } from '../types/role.types'

export function validateRoleName(name: string, existingRoles: RoleDefinition[]): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Le nom du rôle est requis.'
  if (trimmed.length < 3) return 'Le nom du rôle doit contenir au moins 3 caractères.'

  const exists = existingRoles.some(
    (role) => role.name.toLowerCase() === trimmed.toLowerCase(),
  )
  if (exists) return 'Un rôle avec ce nom existe déjà.'

  return null
}

export function validateRolePermissions(permissions: Permission[]): string | null {
  if (permissions.length === 0) return 'Sélectionnez au moins un droit.'
  return null
}

export function createCustomRole(input: {
  name: string
  description: string
  permissions: Permission[]
}): RoleDefinition {
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description.trim(),
    permissions: input.permissions,
    isSystem: false,
    rank: CUSTOM_ROLE_RANK,
  }
}

export function parseStoredRoles(stored: string | null, fallback: RoleDefinition[]): RoleDefinition[] {
  if (!stored) return fallback

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback

    const normalized = parsed
      .map(normalizeRole)
      .filter((role): role is RoleDefinition => role !== null)

    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

function normalizeRole(raw: unknown): RoleDefinition | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Partial<RoleDefinition>
  const id = record.id?.trim()
  const name = record.name?.trim()
  const description = record.description?.trim() ?? ''
  const permissions = record.permissions?.filter(isPermission) ?? []
  const rank = typeof record.rank === 'number' ? record.rank : CUSTOM_ROLE_RANK

  if (!id || !name || permissions.length === 0) return null

  const fallback = defaultRoles.find((role) => role.id === id)

  return {
    id,
    name,
    description,
    permissions,
    isSystem: Boolean(record.isSystem ?? fallback?.isSystem),
    rank: fallback?.rank ?? rank,
  }
}

function isPermission(value: unknown): value is Permission {
  return typeof value === 'string' && ALL_PERMISSIONS.includes(value as Permission)
}

export function mergeRolesWithDefaults(storedRoles: RoleDefinition[]): RoleDefinition[] {
  const customRoles = storedRoles.filter((role) => !role.isSystem)
  const storedSystemRoles = new Map(
    storedRoles.filter((role) => role.isSystem).map((role) => [role.id, role]),
  )

  const mergedSystemRoles = defaultRoles.map((defaultRole) => {
    const stored = storedSystemRoles.get(defaultRole.id)
    if (!stored) return defaultRole

    return {
      ...defaultRole,
      ...stored,
      permissions: [...new Set([...defaultRole.permissions, ...stored.permissions])],
    }
  })

  return [...mergedSystemRoles, ...customRoles]
}
