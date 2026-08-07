import { act, renderHook, waitFor } from '@testing-library/react'
import * as sourceApi from '../api/sourceApi'
import { BACKUP_SOURCES_STORAGE_KEY, useBackupSources } from './useBackupSources'

const sampleInput = {
  name: 'Test Source',
  environment: 'Production',
  apiEndpoint: 'https://test.example.com/services/data/v58.0',
}

describe('useBackupSources', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('adds a source with CONNECTED status', () => {
    const { result } = renderHook(() => useBackupSources())

    act(() => {
      const error = result.current.addSource(sampleInput)
      expect(error).toBeNull()
    })

    const added = result.current.sources[result.current.sources.length - 1]
    expect(added?.name).toBe('Test Source')
    expect(added?.status).toBe('CONNECTED')
    expect(added?.id).toMatch(/^[0-9a-f-]{36}$/i)
  })

  it('tests connection and updates status with notification', async () => {
    jest.spyOn(sourceApi, 'postSourceConnectionTest').mockResolvedValue({
      status: 'CONNECTED',
      message: 'Connexion établie avec succès avec l\'API Salesforce Production Core',
    })

    const { result } = renderHook(() => useBackupSources())
    const id = result.current.sources[0].id

    await act(async () => {
      const promise = result.current.testConnection(id)
      jest.runAllTimersAsync()
      await promise
    })

    await waitFor(() => {
      expect(result.current.sources[0].status).toBe('CONNECTED')
      expect(result.current.notification?.message).toContain('Connexion établie')
    })
  })

  it('deletes a source', () => {
    const { result } = renderHook(() => useBackupSources())
    const initialCount = result.current.sources.length
    const id = result.current.sources[0].id

    act(() => {
      result.current.deleteSource(id)
    })

    expect(result.current.sources).toHaveLength(initialCount - 1)
  })

  it('persists sources to localStorage', () => {
    const { result } = renderHook(() => useBackupSources())

    act(() => {
      result.current.addSource(sampleInput)
    })

    const stored = JSON.parse(localStorage.getItem(BACKUP_SOURCES_STORAGE_KEY) ?? '[]')
    expect(stored.some((s: { name: string }) => s.name === 'Test Source')).toBe(true)
  })
})
