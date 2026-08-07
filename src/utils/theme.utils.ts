import type { Theme } from '../types/theme.types'

export const THEME_STORAGE_KEY = 'datashield-theme'

export function resolveInitialTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}
