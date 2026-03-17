import { authedGetJson, type PaginatedResult } from "@/services/http/authedFetch"

export interface CustomerListItem {
  id: string
  userId: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string | null
    phone: string
    role: string
    status?: "active" | "suspended"
  }
}

export type ListCustomersResponse = PaginatedResult<CustomerListItem>

export async function listCustomers(params: {
  page: number
  limit: number
  name?: string
  phone?: string
}): Promise<ListCustomersResponse> {
  return await authedGetJson<ListCustomersResponse>("/auth/admin/customers", {
    page: params.page,
    limit: params.limit,
    name: params.name,
    phone: params.phone,
  })
}

