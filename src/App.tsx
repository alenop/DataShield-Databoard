import { DashboardPage } from './components/dashboard/DashboardPage'
import { NavigationBar } from './components/navigation/NavigationBar'
import { SettingsPage } from './components/settings/SettingsPage'
import { SourcesPage } from './components/sources/SourcesPage'
import { UsersPage } from './components/users/UsersPage'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { defaultNavigationItems } from './data/defaultNavigation'
import { useAppSettings } from './hooks/useAppSettings'
import { useBackupSources } from './hooks/useBackupSources'
import { useNavigation } from './hooks/useNavigation'
import { useTheme } from './hooks/useTheme'
import { useUsers } from './hooks/useUsers'
import { isNavGroup } from './types/navigation.types'

function App() {
  const navigation = useNavigation({
    items: defaultNavigationItems,
    defaultActiveId: 'dashboard',
  })
  const theme = useTheme()
  const appSettings = useAppSettings()
  const backupSources = useBackupSources()
  const usersState = useUsers()

  const { activeId, activeItem, isCollapsed } = navigation

  const activeHref =
    activeItem && !isNavGroup(activeItem) ? activeItem.href : undefined

  const showDashboard = activeId === 'dashboard' || activeId === 'backups'
  const showSettings = activeId === 'settings'
  const showSources = activeId === 'sources'
  const showUsers = activeId === 'users'

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <NavigationBar navigation={navigation} />

      <main
        className={[
          'min-h-screen p-6 pt-20 transition-all duration-300 md:pt-6',
          isCollapsed ? 'md:ml-16' : 'md:ml-64',
        ].join(' ')}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex justify-end">
            <ThemeToggle theme={theme} />
          </div>

          {showDashboard ? (
            <DashboardPage appSettings={appSettings} backupSources={backupSources} />
          ) : showSettings ? (
            <SettingsPage appSettings={appSettings} />
          ) : showSources ? (
            <SourcesPage backupSources={backupSources} />
          ) : showUsers ? (
            <UsersPage usersState={usersState} />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeItem?.label ?? 'Page'}
              </h1>
              {activeHref && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Route fictive :{' '}
                  <code className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800 dark:text-slate-300">
                    {activeHref}
                  </code>
                </p>
              )}
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Contenu de démonstration pour la section sélectionnée.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
