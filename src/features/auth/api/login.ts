import { LoginSchema, type LoginInput } from '../../../utils/validation'
import { adminLogin, type AdminLoginResponse } from '../../../services/auth'

export async function loginAdminApi(
  input: LoginInput,
): Promise<AdminLoginResponse> {
  const parsed = LoginSchema.parse(input)
  return await adminLogin(parsed)
}

