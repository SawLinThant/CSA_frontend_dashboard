import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider as ReduxProvider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { store } from '../../store'
import i18n from '../../i18n'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>{children}</BrowserRouter>
      </I18nextProvider>
    </ReduxProvider>
  )
}

