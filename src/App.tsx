import { AppProviders } from './app/providers/AppProviders'
import { AppRoutes } from './app/routes'
import { AuthInitializer } from './features/auth/components/AuthInitializer'

function App() {
  return (
    <AppProviders>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
    </AppProviders>
  )
}

export default App
