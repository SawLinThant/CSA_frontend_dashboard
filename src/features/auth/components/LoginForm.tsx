import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface LoginFormProps {
  email: string
  password: string
  error: string | null
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

// This component recreates the shadcn "login-04" layout using Tailwind utility
// classes, without introducing any new behavior. It is purely presentational.
export function LoginForm({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  const { t } = useTranslation('auth')

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-slate-950 px-8 py-8 sm:px-12 lg:px-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Secure admin access</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              {t('login.title')}
            </h1>
            <p className="max-w-md text-sm text-slate-400">
              Sign in to manage farmers, products, and orders in your farming
              ecommerce platform.
            </p>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} Farming Admin. All rights reserved.
        </p>
      </div>
      <div className="flex items-center justify-center bg-slate-900 px-6 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                {t('login.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                {t('login.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {error ? (
              <p className="text-sm text-rose-400" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:opacity-60"
            >
              {t('login.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


