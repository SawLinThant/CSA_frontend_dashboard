import { authedGetJson, type PaginatedResult } from "@/services/http/authedFetch"

export interface FarmerListItem {
  id: string
  userId: string
  createdAt: string
  farmName: string
  farmLocation: string
  farmDescription?: string | null
  user: {
    id: string
    name: string
    email: string | null
    phone: string
    role: string
    status?: "active" | "suspended"
  }
}

export type ListFarmersResponse = PaginatedResult<FarmerListItem>

export async function listFarmers(params: {
  page: number
  limit: number
  name?: string
  phone?: string
}): Promise<ListFarmersResponse> {
  return await authedGetJson<ListFarmersResponse>("/auth/admin/farmers", {
    page: params.page,
    limit: params.limit,
    name: params.name,
    phone: params.phone,
  })
}

