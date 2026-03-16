import { useTranslation } from 'react-i18next'

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'my-MM', label: 'Myanmar' },
] as const

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')

  return (
    <label className="inline-flex items-center gap-2 text-xs text-slate-400">
      <span>{t('language')}</span>
      <select
        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
        value={i18n.language}
        onChange={(event) => {
          const lng = event.target.value
          void i18n.changeLanguage(lng)
          window.localStorage.setItem('lang', lng)
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  )
}

