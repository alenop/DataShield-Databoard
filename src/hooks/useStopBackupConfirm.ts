import { useCallback, useEffect, useState } from 'react'

interface UseStopBackupConfirmOptions {
  onConfirmStop: (id: string) => void
  requireConfirmation: boolean
}

export function useStopBackupConfirm({
  onConfirmStop,
  requireConfirmation,
}: UseStopBackupConfirmOptions) {
  const [pendingStopId, setPendingStopId] = useState<string | null>(null)
  const [pendingBackupName, setPendingBackupName] = useState<string | null>(null)

  const requestStop = useCallback(
    (id: string, backupName: string) => {
      if (requireConfirmation) {
        setPendingStopId(id)
        setPendingBackupName(backupName)
        return
      }
      onConfirmStop(id)
    },
    [requireConfirmation, onConfirmStop],
  )

  const confirmStop = useCallback(() => {
    if (!pendingStopId) return
    onConfirmStop(pendingStopId)
    setPendingStopId(null)
    setPendingBackupName(null)
  }, [pendingStopId, onConfirmStop])

  const cancelStop = useCallback(() => {
    setPendingStopId(null)
    setPendingBackupName(null)
  }, [])

  useEffect(() => {
    if (!pendingStopId) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelStop()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [pendingStopId, cancelStop])

  return {
    isOpen: pendingStopId !== null,
    backupName: pendingBackupName,
    requestStop,
    confirmStop,
    cancelStop,
  }
}

export type StopBackupConfirmState = ReturnType<typeof useStopBackupConfirm>
