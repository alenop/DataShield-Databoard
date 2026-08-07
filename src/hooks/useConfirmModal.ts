import { useCallback, useEffect, useState } from 'react'

export type ConfirmActionType = 'backup' | 'restore'

interface ConfirmModalConfig {
  title: string
  message: string
  confirmLabel: string
  variant: 'primary' | 'danger'
}

export const confirmModalConfig: Record<ConfirmActionType, ConfirmModalConfig> = {
  backup: {
    title: 'Lancer une sauvegarde',
    message:
      'Voulez-vous lancer une sauvegarde manuelle de toutes les sources configurées ? Cette opération peut prendre plusieurs minutes.',
    confirmLabel: 'Lancer la sauvegarde',
    variant: 'primary',
  },
  restore: {
    title: 'Restaurer une sauvegarde',
    message:
      'Attention : la restauration écrasera les données actuelles avec la dernière sauvegarde disponible. Cette action est irréversible.',
    confirmLabel: 'Confirmer la restauration',
    variant: 'danger',
  },
}

interface UseConfirmModalReturn {
  isOpen: boolean
  action: ConfirmActionType | null
  feedback: string | null
  openModal: (action: ConfirmActionType) => void
  closeModal: () => void
  confirm: () => void
}

export function useConfirmModal(): UseConfirmModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [action, setAction] = useState<ConfirmActionType | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const openModal = useCallback((nextAction: ConfirmActionType) => {
    setAction(nextAction)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setAction(null)
  }, [])

  const confirm = useCallback(() => {
    if (!action) return

    const messages: Record<ConfirmActionType, string> = {
      backup: 'Sauvegarde lancée avec succès. Opération en cours…',
      restore: 'Restauration initiée. Les données seront remplacées sous peu.',
    }

    setFeedback(messages[action])
    closeModal()
    setTimeout(() => setFeedback(null), 4000)
  }, [action, closeModal])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeModal])

  return { isOpen, action, feedback, openModal, closeModal, confirm }
}
