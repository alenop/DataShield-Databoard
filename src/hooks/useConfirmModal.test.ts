import { act, renderHook } from '@testing-library/react'
import { useConfirmModal } from './useConfirmModal'

describe('useConfirmModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('opens modal with backup action', () => {
    const { result } = renderHook(() => useConfirmModal())

    act(() => {
      result.current.openModal('backup')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.action).toBe('backup')
  })

  it('closes modal on cancel', () => {
    const { result } = renderHook(() => useConfirmModal())

    act(() => {
      result.current.openModal('restore')
    })

    act(() => {
      result.current.closeModal()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.action).toBeNull()
  })

  it('shows feedback and closes modal on confirm', () => {
    const { result } = renderHook(() => useConfirmModal())

    act(() => {
      result.current.openModal('backup')
    })

    act(() => {
      result.current.confirm()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.feedback).toContain('Sauvegarde lancée')
  })

  it('clears feedback after timeout', () => {
    const { result } = renderHook(() => useConfirmModal())

    act(() => {
      result.current.openModal('restore')
      result.current.confirm()
    })

    act(() => {
      jest.advanceTimersByTime(4000)
    })

    expect(result.current.feedback).toBeNull()
  })
})
