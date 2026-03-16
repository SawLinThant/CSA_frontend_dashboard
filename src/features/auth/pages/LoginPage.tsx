import type { FormEvent } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../../store/hooks'
import { setCredentials } from '../store/authSlice'
import { LoginForm } from '../components/LoginForm'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!email || !password) {
      setError(t('login.invalid'))
      return
    }

    dispatch(
      setCredentials({
        user: {
          id: '1',
          name: 'Admin',
          email,
          role: 'admin',
        },
        token: 'demo-token',
      }),
    )

    const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
    navigate(from, { replace: true })
  }

  return (
    <LoginForm
      email={email}
      password={password}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  )
}

