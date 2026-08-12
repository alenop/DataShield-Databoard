import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AuditPage } from './components/audit/AuditPage'

import { AlertsPage } from './components/alerts/AlertsPage'

import { BackupsPage } from './components/backups/BackupsPage'

import { DemoGuidePage } from './components/demo/DemoGuidePage'

import { DashboardPage } from './components/dashboard/DashboardPage'

import { ExportsPage } from './components/exports/ExportsPage'

import { ImportsPage } from './components/imports/ImportsPage'

import { NavigationBar } from './components/navigation/NavigationBar'

import { PoliciesPage } from './components/policies/PoliciesPage'

import { SettingsPage } from './components/settings/SettingsPage'

import { SourcesPage } from './components/sources/SourcesPage'

import { UsersPage } from './components/users/UsersPage'

import { LanguageToggle } from './components/ui/LanguageToggle'

import { ThemeToggle } from './components/ui/ThemeToggle'

import { useAlerts } from './hooks/useAlerts'

import { useAppSettings } from './hooks/useAppSettings'

import { useAuditEvents } from './hooks/useAuditEvents'

import { useBackupPolicies } from './hooks/useBackupPolicies'

import { useBackupRecords } from './hooks/useBackupRecords'

import { useBackupSchedules } from './hooks/useBackupSchedules'

import { useBackupSources } from './hooks/useBackupSources'

import { useDataExports } from './hooks/useDataExports'

import { useDemoScenario, type DemoScenarioState } from './hooks/useDemoScenario'

import { useNavigation } from './hooks/useNavigation'

import { useRestoreJobs } from './hooks/useRestoreJobs'

import { useRoles } from './hooks/useRoles'

import type { ThemeState } from './hooks/useTheme'

import { useTheme } from './hooks/useTheme'

import { useUsers } from './hooks/useUsers'

import type { DemoCurrentUser, DemoScenarioId } from './types/demoScenario.types'
import { DEMO_LAUNCH_PAGE_KEY } from './types/demoGuide.types'

import { isNavGroup } from './types/navigation.types'

import { buildNavigationItems } from './utils/navigationBadges.utils'

import { localizeNavigationItems } from './utils/navigationI18n.utils'

import { buildRestoreBackupOptions } from './utils/backupRecord.utils'
import { buildExportBackupOptions } from './utils/dataExport.utils'
import { createAuditLogger } from './utils/auditLogger.utils'



interface AppContentProps {

  demoScenario: DemoScenarioState

  currentUser: DemoCurrentUser

  theme: ThemeState

}

function readPendingLaunchPage(): string | undefined {
  const pending = sessionStorage.getItem(DEMO_LAUNCH_PAGE_KEY)
  if (!pending) return undefined
  sessionStorage.removeItem(DEMO_LAUNCH_PAGE_KEY)
  return pending
}



function AppContent({ demoScenario, currentUser, theme }: AppContentProps) {

  const { t, i18n } = useTranslation()

  const [initialNavPage] = useState(() => readPendingLaunchPage() ?? 'dashboard')

  const handleLaunchDemoScenario = useCallback(
    (scenarioId: DemoScenarioId, startPageId: string) => {
      sessionStorage.setItem(DEMO_LAUNCH_PAGE_KEY, startPageId)
      demoScenario.switchScenario(scenarioId)
    },
    [demoScenario],
  )

  const appSettings = useAppSettings()

  const auditEvents = useAuditEvents()

  const logAudit = useMemo(
    () =>
      createAuditLogger(auditEvents.appendEvent, {
        actor: currentUser.name,
        actorEmail: currentUser.email,
      }),
    [auditEvents.appendEvent, currentUser.name, currentUser.email],
  )

  const backupSources = useBackupSources({ logAudit })

  const initialBackupRecords = useMemo(
    () => demoScenario.scenarioMeta.backupRecords,
    [demoScenario.scenarioMeta.backupRecords],
  )

  const backupRecords = useBackupRecords({
    initialRecords: initialBackupRecords,
    username: currentUser.name,
    sources: backupSources.sources,
    logAudit,
  })

  const backupSchedules = useBackupSchedules(backupSources.sources)

  const rolesState = useRoles(currentUser.roleId)

  const usersState = useUsers({ currentUser, roles: rolesState.roles, logAudit })

  const policiesState = useBackupPolicies({
    actorRoleId: currentUser.roleId,
    roles: rolesState.roles,
    availableSourceIds: backupSources.sources.map((source) => source.id),
    logAudit,
  })

  const alertsState = useAlerts()

  const availableExportBackups = useMemo(
    () => buildExportBackupOptions(backupRecords.records, backupSources.sources),
    [backupRecords.records, backupSources.sources],
  )

  const dataExports = useDataExports(availableExportBackups, logAudit)

  const availableRestoreBackups = useMemo(
    () => buildRestoreBackupOptions(backupRecords.records, backupSources.sources),
    [backupRecords.records, backupSources.sources],
  )

  const restoreJobs = useRestoreJobs({
    availableBackups: availableRestoreBackups,
    availableTargets: backupSources.sources.map((source) => ({
      id: source.id,
      name: `${source.name} (${source.environment})`,
    })),
    logAudit,
  })



  const rawNavigationItems = useMemo(

    () =>

      buildNavigationItems({

        criticalAlerts: alertsState.summary.critical,

        warningAlerts: alertsState.summary.warning,

        infoAlerts: alertsState.summary.info,

        failedBackups: backupRecords.statusCounts.failure,

        exportsPreparing: dataExports.exports.filter((exportItem) => exportItem.status === 'preparing')

          .length,

        importsInProgress: restoreJobs.restoreJobs.filter((job) => job.status === 'in_progress')

          .length,

      }),

    [alertsState.summary, backupRecords.statusCounts.failure, dataExports.exports, restoreJobs.restoreJobs],

  )



  const navigationItems = useMemo(

    () => localizeNavigationItems(rawNavigationItems, t),

    [rawNavigationItems, i18n.language, t],

  )



  const navigation = useNavigation({

    items: navigationItems,

    defaultActiveId: initialNavPage,

  })



  const { activeId, activeItem, isCollapsed } = navigation



  const activeHref =

    activeItem && !isNavGroup(activeItem) ? activeItem.href : undefined



  const showDashboard = activeId === 'dashboard'

  const showDemoGuide = activeId === 'demo'

  const showBackups = activeId === 'backups'

  const showSettings = activeId === 'settings'

  const showSources = activeId === 'sources'

  const showUsers = activeId === 'users'

  const showPolicies = activeId === 'policies'

  const showAudit = activeId === 'audit'

  const showExports = activeId === 'exports'

  const showImports = activeId === 'imports'

  const showAlerts = activeId === 'alerts'



  return (

    <>

      <NavigationBar navigation={navigation} currentUser={currentUser} />



      <main

        className={[

          'min-h-screen p-6 pt-20 transition-all duration-300 md:pt-6',

          isCollapsed ? 'md:ml-16' : 'md:ml-64',

        ].join(' ')}

      >

        <div className="mx-auto max-w-6xl">

          <div className="mb-6 flex justify-end gap-3">

            <LanguageToggle />

            <ThemeToggle theme={theme} />

          </div>



          {showDashboard ? (

            <DashboardPage

              appSettings={appSettings}

              backupSources={backupSources}

              backupRecords={backupRecords}

              restoreJobs={restoreJobs}

              availableRestoreBackups={availableRestoreBackups}

              demoScenario={demoScenario}

              onOpenDemoGuide={() => navigation.selectItem('demo')}

            />

          ) : showDemoGuide ? (

            <DemoGuidePage
              demoScenario={demoScenario}
              onLaunchScenario={handleLaunchDemoScenario}
            />

          ) : showBackups ? (

            <BackupsPage

              appSettings={appSettings}

              backupSources={backupSources}

              backupRecords={backupRecords}

              backupSchedules={backupSchedules}

            />

          ) : showSettings ? (

            <SettingsPage appSettings={appSettings} />

          ) : showSources ? (

            <SourcesPage backupSources={backupSources} />

          ) : showUsers ? (

            <UsersPage
              usersState={usersState}
              rolesState={rolesState}
              currentUser={currentUser}
            />

          ) : showPolicies ? (

            <PoliciesPage

              policiesState={policiesState}

              backupSources={backupSources}

              rolesState={rolesState}

              currentUser={currentUser}

            />

          ) : showAudit ? (

            <AuditPage auditEvents={auditEvents} />

          ) : showExports ? (

            <ExportsPage
              dataExports={dataExports}
              availableExportBackups={availableExportBackups}
            />

          ) : showImports ? (

            <ImportsPage

              restoreJobs={restoreJobs}

              backupSources={backupSources}

              availableBackups={availableRestoreBackups}

            />

          ) : showAlerts ? (

            <AlertsPage alertsState={alertsState} />

          ) : (

            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">

                {activeItem?.label ?? t('common.page')}

              </h1>

              {activeHref && (

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">

                  {t('common.demoRoute')}{' '}

                  <code className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800 dark:text-slate-300">

                    {activeHref}

                  </code>

                </p>

              )}

              <p className="mt-4 text-slate-600 dark:text-slate-400">

                {t('common.demoContent')}

              </p>

            </div>

          )}

        </div>

      </main>

    </>

  )

}



function App() {

  const theme = useTheme()

  const demoScenario = useDemoScenario()



  return (

    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">

      <AppContent

        key={demoScenario.version}

        demoScenario={demoScenario}

        currentUser={demoScenario.currentUser}

        theme={theme}

      />

    </div>

  )

}



export default App

