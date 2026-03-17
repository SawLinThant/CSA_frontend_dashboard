import type { LoginInput } from '../../utils/validation'
import { httpClient } from '../http/client'
import { routes } from '../../config/routes'

export interface AdminLoginResponse {
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
}

const ACCESS_TOKEN_KEY = 'admin_access_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'
const USER_KEY = 'admin_user'

export async function adminLogin(
  credentials: LoginInput,
): Promise<AdminLoginResponse> {
  const response = await httpClient.post<LoginInput, AdminLoginResponse>(
    routes.auth.adminLogin,
    credentials,
  )

  persistTokens(response.accessToken, response.refreshToken ?? null)

  return response
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshTokenResponse> {
  const response = await httpClient.post<{ refreshToken: string }, RefreshTokenResponse>(
    '/auth/refresh',
    { refreshToken },
  )

  persistTokens(response.accessToken, response.refreshToken ?? refreshToken)

  return response
}

export function persistTokens(
  accessToken: string | null,
  refreshToken: string | null,
): void {
  if (typeof window === 'undefined') return

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export interface StoredAuthUser {
  id: string
  name: string
  email: string
  role: string
}

export function persistAuthSession(
  user: StoredAuthUser | null,
  accessToken: string | null,
  refreshToken: string | null,
): void {
  persistTokens(accessToken, refreshToken)

  if (typeof window === 'undefined') return

  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(USER_KEY)
  }
}

export function loadAuthSession(): {
  user: StoredAuthUser | null
  accessToken: string | null
  refreshToken: string | null
} {
  const tokens = loadTokens()

  if (typeof window === 'undefined') {
    return { user: null, ...tokens }
  }

  const raw = window.localStorage.getItem(USER_KEY)
  let user: StoredAuthUser | null = null

  if (raw) {
    try {
      user = JSON.parse(raw) as StoredAuthUser
    } catch {
      user = null
    }
  }

  return { user, ...tokens }
}

export async function logoutApi(): Promise<void> {
  try {
    await httpClient.post<undefined, { message: string }>(
      routes.auth.logout,
      undefined as unknown as undefined,
    )
  } catch {
    // ignore network/logout API errors; client logout is still effective
  } finally {
    persistAuthSession(null, null, null)
  }
}

export function loadTokens(): {
  accessToken: string | null
  refreshToken: string | null
} {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null }
  }

  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  }
}

