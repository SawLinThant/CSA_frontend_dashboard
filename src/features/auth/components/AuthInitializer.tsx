import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../../store/hooks'
import { loadAuthSession } from '../../../services/auth'
import { setCredentials } from '../store/authSlice'

interface AuthInitializerProps {
  children: ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { user, accessToken, refreshToken } = loadAuthSession()

    if (user && accessToken) {
      dispatch(
        setCredentials({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'admin',
          },
          accessToken,
          refreshToken,
        }),
      )
    }

    setReady(true)
  }, [dispatch])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  return children
}

