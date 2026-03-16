import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoginForm, type LoginFormValues } from '@/components/login-form'
import { loginAdminApi } from '../api/login'
import { useAppDispatch } from '../../../store/hooks'
import { setCredentials } from '../store/authSlice'
import { toast } from 'sonner'
import { persistAuthSession } from '../../../services/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: LoginFormValues) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await loginAdminApi(values)

      const authUser = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: 'admin' as const,
      }

      dispatch(
        setCredentials({
          user: authUser,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken ?? null,
        }),
      )

      persistAuthSession(
        authUser,
        response.accessToken,
        response.refreshToken ?? null,
      )

      const from =
        (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
      navigate(from, { replace: true })
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : 'Login failed'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={error}
      />
    </div>
  )
}

