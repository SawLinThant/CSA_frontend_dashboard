import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { ProtectedRoute } from './protected'
import { useTranslation } from 'react-i18next'

const DashboardPage = lazy(
  () => import('../../features/dashboard/pages/DashboardPage'),
)
const ProductsListPage = lazy(
  () => import('../../features/products/pages/ProductsListPage'),
)
const LoginPage = lazy(
  () => import('../../features/auth/pages/LoginPage'),
)

export function AppRoutes() {
  const { t } = useTranslation('common')

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-slate-400">
          {t('loading')}
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProductsListPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

