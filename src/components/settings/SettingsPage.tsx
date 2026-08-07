import type { AppSettingsState } from '../../hooks/useAppSettings'

interface SettingsPageProps {
  appSettings: AppSettingsState
}

export function SettingsPage({ appSettings }: SettingsPageProps) {
  const { settings, setConfirmStopBackup } = appSettings

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Préférences de l&apos;application
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Sauvegardes</h2>

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={settings.confirmStopBackup}
            onChange={(event) => setConfirmStopBackup(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900 dark:text-white">
              Demander confirmation avant d&apos;arrêter une sauvegarde
            </span>
            <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
              Affiche une modale de confirmation lorsque vous cliquez sur le bouton d&apos;arrêt.
              Désactivez cette option pour arrêter immédiatement.
            </span>
          </span>
        </label>
      </section>
    </div>
  )
}
