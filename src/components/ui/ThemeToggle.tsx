import { Moon, Sun } from 'lucide-react'
import type { ThemeState } from '../../hooks/useTheme'
import type { Theme } from '../../types/theme.types'

interface ThemeToggleProps {
  theme: ThemeState
}

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
]

export function ThemeToggle({ theme }: ThemeToggleProps) {
  const { theme: current, setTheme } = theme

  return (
    <div
      role="group"
      aria-label="Sélecteur de thème"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = current === value

        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            className={[
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
