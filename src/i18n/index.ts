import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'

export const LANGUAGE_STORAGE_KEY = 'datashield-language'
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'fr'

function resolveInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'fr' || stored === 'en') return stored

  const browserLanguage = navigator.language.toLowerCase()
  return browserLanguage.startsWith('en') ? 'en' : 'fr'
}

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: resolveInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  document.documentElement.lang = language
})

document.documentElement.lang = i18n.language

export default i18n
