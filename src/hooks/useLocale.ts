import { useTranslation } from 'react-i18next'

export function useLocale() {
  const { i18n } = useTranslation()
  const language = i18n.language

  const setLanguage = (lng: string) => {
    void i18n.changeLanguage(lng)
    window.localStorage.setItem('lang', lng)
  }

  return { language, setLanguage }
}

