import { useAppSelector } from '../store/hooks'

export function useAuth() {
  const user = useAppSelector((state) => state.auth.user)
  const token = useAppSelector((state) => state.auth.token)

  return { user, token }
}

