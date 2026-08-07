import { ADMIN_DEMO_USER_ID } from './currentUser'
import type { User } from '../types/user.types'

export const mockUsers: User[] = [
  {
    id: ADMIN_DEMO_USER_ID,
    name: 'Admin Demo',
    email: 'admin@datashield.test',
    roleId: 'super_admin',
    status: 'active',
    lastLogin: '2026-08-07T14:00:00',
    mfaEnabled: true,
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    name: 'Sophie Martin',
    email: 'admin@entreprise.com',
    roleId: 'admin',
    status: 'active',
    lastLogin: '2026-08-07T08:15:00',
    mfaEnabled: true,
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    name: 'Lucas Dupont',
    email: 'operator@entreprise.com',
    roleId: 'backup_operator',
    status: 'active',
    lastLogin: '2026-08-07T07:42:00',
    mfaEnabled: true,
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    name: 'Camille Renard',
    email: 'auditor@cabinet-audit.com',
    roleId: 'read_only',
    status: 'active',
    lastLogin: '2026-08-06T16:30:00',
    mfaEnabled: false,
  },
]
