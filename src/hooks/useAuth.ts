import { useAppSelector } from '../store/hooks'

export function useAuth() {
  const user = useAppSelector((state) => state.auth.user)
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const refreshToken = useAppSelector((state) => state.auth.refreshToken)

  return { user, accessToken, refreshToken }
}

