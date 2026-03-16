import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider as ReduxProvider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { store } from '../../store'
import i18n from '../../i18n'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <BrowserRouter>
            {children}
            <Toaster richColors closeButton />
          </BrowserRouter>
        </TooltipProvider>
      </I18nextProvider>
    </ReduxProvider>
  )
}

