import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enDashboard from './locales/en/dashboard.json'
import myCommon from './locales/my-MM/common.json'
import myAuth from './locales/my-MM/auth.json'
import myDashboard from './locales/my-MM/dashboard.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
  },
  'my-MM': {
    common: myCommon,
    auth: myAuth,
    dashboard: myDashboard,
  },
}

void i18n.use(initReactI18next).init({
  resources,
  lng: window.localStorage.getItem('lang') ?? 'en',
  fallbackLng: 'en',
  ns: ['common', 'auth', 'dashboard'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n

