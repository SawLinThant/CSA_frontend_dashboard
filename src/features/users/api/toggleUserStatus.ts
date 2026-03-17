import { authedPatchJson } from "@/services/http/authedFetch"

export interface ToggleUserStatusResponse {
  message?: string
  user?: {
    id: string
    status?: string
  }
}

export async function toggleUserStatus(userId: string): Promise<ToggleUserStatusResponse> {
  return await authedPatchJson<ToggleUserStatusResponse>(`/auth/admin/users/${userId}/toggle-status`)
}

