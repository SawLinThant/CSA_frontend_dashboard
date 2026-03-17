import { authedGetJson, type PaginatedResult } from "@/services/http/authedFetch"

export interface CategoryListItem {
  id: string
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ListCategoriesResponse = PaginatedResult<CategoryListItem>

export async function listCategories(params: {
  page: number
  limit: number
  name?: string
}): Promise<ListCategoriesResponse> {
  return await authedGetJson<ListCategoriesResponse>("/auth/admin/categories", {
    page: params.page,
    limit: params.limit,
    name: params.name,
  })
}

