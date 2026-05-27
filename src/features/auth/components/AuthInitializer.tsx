import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../../store/hooks'
import { loadAuthSession, persistAuthSession, refreshAccessToken, persistTokens } from '../../../services/auth'
import { setCredentials } from '../store/authSlice'

function isJwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

interface AuthInitializerProps {
  children: ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const run = async () => {
      const { user, accessToken, refreshToken } = loadAuthSession()

      if (!user || !accessToken) {
        setReady(true)
        return
      }

      if (!isJwtExpired(accessToken)) {
        dispatch(
          setCredentials({
            user: { id: user.id, name: user.name, email: user.email, role: 'admin' },
            accessToken,
            refreshToken,
          }),
        )
        setReady(true)
        return
      }

      if (refreshToken) {
        try {
          const refreshed = await refreshAccessToken(refreshToken)
          persistTokens(refreshed.accessToken, refreshed.refreshToken ?? refreshToken)
          dispatch(
            setCredentials({
              user: { id: user.id, name: user.name, email: user.email, role: 'admin' },
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken ?? refreshToken,
            }),
          )
        } catch {
          persistAuthSession(null, null, null)
        }
      } else {
        persistAuthSession(null, null, null)
      }

      setReady(true)
    }

    void run()
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

