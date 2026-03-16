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

export async function adminLogin(
  credentials: LoginInput,
): Promise<AdminLoginResponse> {
  return await httpClient.post<LoginInput, AdminLoginResponse>(
    routes.auth.adminLogin,
    credentials,
  )
}

