import { act, renderHook } from '@testing-library/react'
import { defaultRoles } from '../data/defaultRoles'
import { POLICIES_STORAGE_KEY, useBackupPolicies } from './useBackupPolicies'

describe('useBackupPolicies', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const hookOptions = {
    actorRoleId: 'super_admin',
    roles: defaultRoles,
    availableSourceIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
  }

  it('loads default policies', () => {
    const { result } = renderHook(() => useBackupPolicies(hookOptions))
    expect(result.current.policies.length).toBeGreaterThan(0)
    expect(result.current.canManage).toBe(true)
  })

  it('creates a policy when permitted', () => {
    const { result } = renderHook(() => useBackupPolicies(hookOptions))
    const initialCount = result.current.policies.length

    act(() => {
      const error = result.current.createPolicy({
        name: 'Politique Test',
        frequencyPresetId: 'daily-02',
        retentionDays: 30,
        sourceIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
      })
      expect(error).toBeNull()
    })

    expect(result.current.policies).toHaveLength(initialCount + 1)

    const stored = JSON.parse(localStorage.getItem(POLICIES_STORAGE_KEY) ?? '[]')
    expect(stored.some((p: { name: string }) => p.name === 'Politique Test')).toBe(true)
  })

  it('toggles policy active state', () => {
    const { result } = renderHook(() => useBackupPolicies(hookOptions))
    const policyId = result.current.policies[0].id
    const initialActive = result.current.policies[0].isActive

    act(() => {
      result.current.togglePolicyActive(policyId)
    })

    expect(result.current.policies[0].isActive).toBe(!initialActive)
  })

  it('blocks create for read_only role', () => {
    const { result } = renderHook(() =>
      useBackupPolicies({
        ...hookOptions,
        actorRoleId: 'read_only',
      }),
    )

    expect(result.current.canManage).toBe(false)

    act(() => {
      const error = result.current.createPolicy({
        name: 'Politique Interdite',
        frequencyPresetId: 'daily-02',
        retentionDays: 30,
        sourceIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
      })
      expect(error).not.toBeNull()
    })
  })
})
