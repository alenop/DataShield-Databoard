import { useTranslation } from 'react-i18next'
import type { AppSettingsState } from '../../hooks/useAppSettings'

interface SettingsPageProps {
  appSettings: AppSettingsState
}

export function SettingsPage({ appSettings }: SettingsPageProps) {
  const { t } = useTranslation()
  const { settings, setConfirmStopBackup } = appSettings

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('pages.settings.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('pages.settings.subtitle')}
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('pages.settings.backupsSection')}
        </h2>

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={settings.confirmStopBackup}
            onChange={(event) => setConfirmStopBackup(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900 dark:text-white">
              {t('pages.settings.confirmStopLabel')}
            </span>
            <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
              {t('pages.settings.confirmStopHint')}
            </span>
          </span>
        </label>
      </section>
    </div>
  )
}
