import { authedPatchJson } from "@/services/http/authedFetch"

export interface UpdateCategoryInput {
  name?: string
  description?: string | null
}

export interface UpdateCategoryResponse {
  id: string
  name: string
  description: string | null
}

export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<UpdateCategoryResponse> {
  return await authedPatchJson<UpdateCategoryResponse>(`/auth/admin/categories/${categoryId}`, input)
}

