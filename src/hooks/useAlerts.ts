import { useCallback, useEffect, useMemo, useState } from 'react'
import i18n from '../i18n'
import { mockAlerts } from '../data/mockAlerts'
import type { Alert, AlertSeverityFilter } from '../types/alert.types'
import {
  countAlertSummary,
  filterAlertsBySeverity,
  markAlertAsResolved,
  parseStoredAlerts,
  sortAlerts,
} from '../utils/alert.utils'

export const ALERTS_STORAGE_KEY = 'datashield-alerts'

export function loadAlerts(): Alert[] {
  const stored = localStorage.getItem(ALERTS_STORAGE_KEY)
  return parseStoredAlerts(stored, mockAlerts)
}

export function useAlerts() {
  const [alertRecords, setAlertRecords] = useState<Alert[]>(loadAlerts)
  const [severityFilter, setSeverityFilter] = useState<AlertSeverityFilter>('all')
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alertRecords))
  }, [alertRecords])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  const sortedAlerts = useMemo(() => sortAlerts(alertRecords), [alertRecords])
  const summary = useMemo(() => countAlertSummary(alertRecords), [alertRecords])
  const alerts = useMemo(
    () => filterAlertsBySeverity(sortedAlerts, severityFilter),
    [sortedAlerts, severityFilter],
  )

  const toggleSeverityFilter = useCallback((severity: AlertSeverityFilter) => {
    setSeverityFilter((current) => (current === severity ? 'all' : severity))
  }, [])

  const markAsResolved = useCallback((alertId: string): string | null => {
    const alert = alertRecords.find((item) => item.id === alertId)
    if (!alert) return i18n.t('notifications.alertNotFound')
    if (alert.status === 'resolved') return i18n.t('notifications.alertAlreadyResolved')

    setAlertRecords((prev) => markAlertAsResolved(prev, alertId))
    setNotification({
      message: i18n.t('notifications.alertResolved'),
      type: 'success',
    })
    return null
  }, [alertRecords])

  return {
    alerts,
    sortedAlerts,
    summary,
    severityFilter,
    setSeverityFilter,
    toggleSeverityFilter,
    notification,
    markAsResolved,
  }
}

export type AlertsState = ReturnType<typeof useAlerts>
