import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SupportedLanguage } from '../../i18n'

interface LanguageToggleProps {
  className?: string
}

const options: { value: SupportedLanguage; labelKey: string }[] = [
  { value: 'fr', labelKey: 'language.fr' },
  { value: 'en', labelKey: 'language.en' },
]

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { t, i18n } = useTranslation()
  const currentLanguage = (i18n.language.startsWith('en') ? 'en' : 'fr') as SupportedLanguage

  const handleChange = (language: SupportedLanguage) => {
    void i18n.changeLanguage(language)
  }

  return (
    <div
      role="group"
      aria-label={t('language.selector')}
      className={[
        'inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map(({ value, labelKey }) => {
        const isActive = currentLanguage === value

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleChange(value)}
            aria-pressed={isActive}
            className={[
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
            ].join(' ')}
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            {t(labelKey)}
          </button>
        )
      })}
    </div>
  )
}
