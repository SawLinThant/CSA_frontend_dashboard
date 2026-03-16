import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation('common')

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <span className="text-lg font-semibold tracking-tight">
            {t('appName')}
          </span>
        </div>
        <nav className="mt-4 space-y-1 px-2">
          <NavItem to="/dashboard" label={t('nav.dashboard')} />
          <NavItem to="/products" label={t('nav.products')} />
          <NavItem to="/orders" label={t('nav.orders')} />
          <NavItem to="/settings" label={t('nav.settings')} />
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/40 px-6 py-3">
          <div className="text-sm text-slate-400">
            {/* Placeholder for breadcrumbs */}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-950 px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  )
}

interface NavItemProps {
  to: string
  label: string
}

function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-slate-800 text-slate-50'
            : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-50',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

