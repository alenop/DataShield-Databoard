import type { NavItem } from '../types/navigation.types'

export const defaultNavigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: 'layout-dashboard',
    href: '/dashboard',
  },
  {
    id: 'alerts',
    label: 'Alertes',
    icon: 'bell',
    href: '/alerts',
    badge: { count: 12, variant: 'danger' },
  },
  {
    id: 'data',
    label: 'Données',
    icon: 'database',
    badge: { count: 4, variant: 'warning' },
    children: [
      {
        id: 'backups',
        label: 'Sauvegardes',
        icon: 'hard-drive',
        href: '/data/backups',
        badge: { count: 3 },
      },
      {
        id: 'sources',
        label: 'Sources',
        icon: 'globe',
        href: '/data/sources',
      },
      {
        id: 'exports',
        label: 'Exports',
        icon: 'file-output',
        href: '/data/exports',
      },
      {
        id: 'imports',
        label: 'Imports',
        icon: 'file-input',
        href: '/data/imports',
        badge: { count: 1, variant: 'warning' },
      },
    ],
  },
  {
    id: 'security',
    label: 'Sécurité',
    icon: 'shield',
    children: [
      {
        id: 'policies',
        label: 'Politiques',
        icon: 'file-text',
        href: '/security/policies',
      },
      {
        id: 'audit',
        label: 'Journal d\'audit',
        icon: 'scroll-text',
        href: '/security/audit',
        badge: { count: 5, variant: 'danger' },
      },
      {
        id: 'users',
        label: 'Utilisateurs',
        icon: 'users',
        href: '/security/users',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: 'settings',
    href: '/settings',
  },
]
