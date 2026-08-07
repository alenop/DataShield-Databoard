import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../types/theme.types'
import { resolveInitialTheme, THEME_STORAGE_KEY } from '../utils/theme.utils'

function getInitialTheme(): Theme {
  return resolveInitialTheme(
    localStorage.getItem(THEME_STORAGE_KEY),
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return { theme, setTheme, toggleTheme }
}

export type ThemeState = ReturnType<typeof useTheme>
