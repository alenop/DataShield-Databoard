import { useState } from 'react'
import { Pencil, Plus, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RolesState } from '../../hooks/useRoles'
import type { Permission, RoleDefinition } from '../../types/role.types'
import { canCreateRole, canEditRole } from '../../utils/userPermissions.utils'
import { CreateRoleModal } from './CreateRoleModal'
import { EditRoleModal } from './EditRoleModal'

interface RolesSectionProps {
  rolesState: RolesState
  currentUserRoleId: string
}

export function RolesSection({ rolesState, currentUserRoleId }: RolesSectionProps) {
  const { t } = useTranslation()
  const { roles, createRole, updateRolePermissions } = rolesState
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null)

  const canCreate = canCreateRole(currentUserRoleId, roles)

  if (!canCreate && !roles.some((role) => canEditRole(currentUserRoleId, role, roles))) {
    return null
  }

  const permissionLabel = (permission: Permission) =>
    t(`pages.users.permissions.${permission}`)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <Shield className="h-4 w-4" aria-hidden="true" />
            {t('common.countWithLabel', {
              label: t('pages.users.rolesSection'),
              count: roles.length,
            })}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('pages.users.rolesHint')}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('common.createRoleButton')}
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                {t('common.role')}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                {t('common.roleType')}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                {t('common.permissions')}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {roles.map((role) => {
              const editable = canEditRole(currentUserRoleId, role, roles)

              return (
                <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{role.name}</div>
                    {role.description && (
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {role.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                        role.isSystem
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
                      ].join(' ')}
                    >
                      {role.isSystem ? t('common.system') : t('common.custom')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    <span className="line-clamp-2 text-xs">
                      {role.permissions.map((p) => permissionLabel(p)).join(', ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editable ? (
                      <button
                        type="button"
                        onClick={() => setEditingRole(role)}
                        aria-label={t('common.editRolePermissionsAria', { name: role.name })}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('common.edit')}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {t('common.emptyDash')}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createRole}
      />

      <EditRoleModal
        isOpen={editingRole !== null}
        role={editingRole}
        onClose={() => setEditingRole(null)}
        onSave={updateRolePermissions}
      />
    </section>
  )
}
