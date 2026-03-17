import { authedPostJson } from "@/services/http/authedFetch"

export interface CreateCategoryInput {
  name: string
  description?: string | null
}

export interface CreateCategoryResponse {
  id: string
  name: string
  description: string | null
}

export async function createCategory(input: CreateCategoryInput): Promise<CreateCategoryResponse> {
  return await authedPostJson<CreateCategoryResponse>("/auth/admin/categories", input)
}

