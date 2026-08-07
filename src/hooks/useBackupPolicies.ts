import { useCallback, useEffect, useState } from 'react'
import { mockBackupPolicies } from '../data/mockBackupPolicies'
import type { BackupPolicy, CreateBackupPolicyInput } from '../types/backupPolicy.types'
import type { RoleDefinition } from '../types/role.types'
import {
  applyPolicyInput,
  createBackupPolicy,
  parseStoredBackupPolicies,
  validateCreatePolicyInput,
  validateUpdatePolicyInput,
} from '../utils/backupPolicy.utils'
import { canManagePolicies } from '../utils/userPermissions.utils'

export const POLICIES_STORAGE_KEY = 'datashield-backup-policies'

export function loadBackupPolicies(): BackupPolicy[] {
  const stored = localStorage.getItem(POLICIES_STORAGE_KEY)
  return parseStoredBackupPolicies(stored, mockBackupPolicies)
}

interface UseBackupPoliciesOptions {
  actorRoleId: string
  roles: RoleDefinition[]
  availableSourceIds: string[]
}

export function useBackupPolicies({
  actorRoleId,
  roles,
  availableSourceIds,
}: UseBackupPoliciesOptions) {
  const [policies, setPolicies] = useState<BackupPolicy[]>(loadBackupPolicies)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const canManage = canManagePolicies(actorRoleId, roles)

  useEffect(() => {
    localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(policies))
  }, [policies])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  const createPolicy = useCallback(
    (input: CreateBackupPolicyInput): string | null => {
      if (!canManage) {
        return "Vous n'avez pas l'autorisation de créer une politique."
      }

      const error = validateCreatePolicyInput(
        input,
        policies.map((policy) => policy.name),
        availableSourceIds,
      )
      if (error) return error

      const policy = createBackupPolicy(input)
      setPolicies((prev) => [policy, ...prev])
      setNotification({
        message: `Politique « ${policy.name} » créée avec succès.`,
        type: 'success',
      })
      return null
    },
    [policies, availableSourceIds, canManage],
  )

  const togglePolicyActive = useCallback(
    (policyId: string): string | null => {
      if (!canManage) {
        return "Vous n'avez pas l'autorisation de modifier cette politique."
      }

      const policy = policies.find((item) => item.id === policyId)
      if (!policy) return 'Politique introuvable.'

      setPolicies((prev) =>
        prev.map((item) =>
          item.id === policyId ? { ...item, isActive: !item.isActive } : item,
        ),
      )
      setNotification({
        message: policy.isActive
          ? `Politique « ${policy.name} » désactivée.`
          : `Politique « ${policy.name} » activée.`,
        type: 'success',
      })
      return null
    },
    [policies, canManage],
  )

  const updatePolicy = useCallback(
    (policyId: string, input: CreateBackupPolicyInput): string | null => {
      if (!canManage) {
        return "Vous n'avez pas l'autorisation de modifier cette politique."
      }

      const policy = policies.find((item) => item.id === policyId)
      if (!policy) return 'Politique introuvable.'

      const error = validateUpdatePolicyInput(
        input,
        policies,
        policyId,
        availableSourceIds,
      )
      if (error) return error

      const updated = applyPolicyInput(policy, input)
      setPolicies((prev) =>
        prev.map((item) => (item.id === policyId ? updated : item)),
      )
      setNotification({
        message: `Politique « ${updated.name} » mise à jour.`,
        type: 'success',
      })
      return null
    },
    [policies, availableSourceIds, canManage],
  )

  return {
    policies,
    notification,
    canManage,
    createPolicy,
    updatePolicy,
    togglePolicyActive,
  }
}

export type BackupPoliciesState = ReturnType<typeof useBackupPolicies>
