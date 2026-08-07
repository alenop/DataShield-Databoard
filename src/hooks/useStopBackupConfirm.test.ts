import { act, renderHook } from '@testing-library/react'
import { useStopBackupConfirm } from './useStopBackupConfirm'

describe('useStopBackupConfirm', () => {
  it('opens confirmation when required', () => {
    const onConfirmStop = jest.fn()
    const { result } = renderHook(() =>
      useStopBackupConfirm({ onConfirmStop, requireConfirmation: true }),
    )

    act(() => {
      result.current.requestStop('1', 'Backup A')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.backupName).toBe('Backup A')
    expect(onConfirmStop).not.toHaveBeenCalled()
  })

  it('stops immediately when confirmation is disabled', () => {
    const onConfirmStop = jest.fn()
    const { result } = renderHook(() =>
      useStopBackupConfirm({ onConfirmStop, requireConfirmation: false }),
    )

    act(() => {
      result.current.requestStop('1', 'Backup A')
    })

    expect(result.current.isOpen).toBe(false)
    expect(onConfirmStop).toHaveBeenCalledWith('1')
  })

  it('confirms stop and closes modal', () => {
    const onConfirmStop = jest.fn()
    const { result } = renderHook(() =>
      useStopBackupConfirm({ onConfirmStop, requireConfirmation: true }),
    )

    act(() => {
      result.current.requestStop('1', 'Backup A')
    })

    act(() => {
      result.current.confirmStop()
    })

    expect(onConfirmStop).toHaveBeenCalledWith('1')
    expect(result.current.isOpen).toBe(false)
  })

  it('cancels stop request', () => {
    const onConfirmStop = jest.fn()
    const { result } = renderHook(() =>
      useStopBackupConfirm({ onConfirmStop, requireConfirmation: true }),
    )

    act(() => {
      result.current.requestStop('1', 'Backup A')
    })

    act(() => {
      result.current.cancelStop()
    })

    expect(result.current.isOpen).toBe(false)
    expect(onConfirmStop).not.toHaveBeenCalled()
  })
})
