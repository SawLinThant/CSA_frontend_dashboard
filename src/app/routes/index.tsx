import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './protected'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/layout/AdminLayout'

const DashboardPage = lazy(
  () => import('../../features/dashboard/pages/DashboardPage'),
)
const ProductsListPage = lazy(
  () => import('../../features/products/pages/ProductsListPage'),
)
const CustomersListPage = lazy(
  () => import('../../features/customers/pages/CustomersListPage'),
)
const FarmersListPage = lazy(
  () => import('../../features/farmers/pages/FarmersListPage'),
)
const CategoriesListPage = lazy(
  () => import('../../features/categories/pages/CategoriesListPage'),
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
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProductsListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <CustomersListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmers"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <FarmersListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <CategoriesListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

