import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Database,
  FileInput,
  FileOutput,
  FileText,
  Globe,
  HardDrive,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import type { NavIconName } from '../types/navigation.types'

export const navIconMap: Record<NavIconName, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  bell: Bell,
  database: Database,
  shield: Shield,
  settings: Settings,
  'hard-drive': HardDrive,
  'file-output': FileOutput,
  'file-input': FileInput,
  'file-text': FileText,
  users: Users,
  'scroll-text': ScrollText,
  globe: Globe,
}

interface NavIconProps {
  name: NavIconName
  className?: string
}

export function NavIcon({ name, className }: NavIconProps) {
  const Icon = navIconMap[name]
  return <Icon className={className} aria-hidden="true" />
}
