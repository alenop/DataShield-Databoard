import type { BackupSource } from '../../types/backupSource.types'
import type { CreateBackupScheduleInput } from '../../types/backupSchedule.types'
import { LaunchBackupModal } from '../dashboard/LaunchBackupModal'

interface ScheduleBackupModalProps {
  isOpen: boolean
  sources: BackupSource[]
  onClose: () => void
  onCreate: (input: CreateBackupScheduleInput) => string | null
}

export function ScheduleBackupModal({
  isOpen,
  sources,
  onClose,
  onCreate,
}: ScheduleBackupModalProps) {
  return (
    <LaunchBackupModal
      variant="schedule"
      isOpen={isOpen}
      sources={sources}
      onClose={onClose}
      onCreate={onCreate}
    />
  )
}
