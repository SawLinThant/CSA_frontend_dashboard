import { env } from "@/config/env"
import type { ApiErrorPayload } from "@/types/api"

export interface PublicProductListItem {
  id: string
  name: string
  description?: string | null
  categoryId: string
  unit: string
  basePrice: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ListProductsResponse {
  items: PublicProductListItem[]
  total: number
  page: number
  limit: number
}

export async function listProducts(params: {
  page: number
  limit: number
  name?: string
  categoryId?: string
  isActive?: boolean
}): Promise<ListProductsResponse> {
  const url = new URL(env.apiBaseUrl + "/api/products")
  url.searchParams.set("page", String(params.page))
  url.searchParams.set("limit", String(params.limit))
  if (params.name) url.searchParams.set("name", params.name)
  if (params.categoryId) url.searchParams.set("categoryId", params.categoryId)
  if (params.isActive !== undefined) url.searchParams.set("isActive", String(params.isActive))

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  const json = (await response.json().catch(() => undefined)) as
    | ListProductsResponse
    | ApiErrorPayload
    | undefined

  if (!response.ok) {
    const payload = json as ApiErrorPayload | undefined
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`)
  }

  return json as ListProductsResponse
}

