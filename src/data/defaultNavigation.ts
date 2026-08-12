import type { NavItem } from '../types/navigation.types'

export const defaultNavigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: 'layout-dashboard',
    href: '/dashboard',
  },
  {
    id: 'demo',
    label: 'Guide de démo',
    icon: 'circle-play',
    href: '/demo',
  },
  {
    id: 'alerts',
    label: 'Alertes',
    icon: 'bell',
    href: '/alerts',
  },
  {
    id: 'data',
    label: 'Données',
    icon: 'database',
    children: [
      {
        id: 'backups',
        label: 'Sauvegardes',
        icon: 'hard-drive',
        href: '/data/backups',
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
