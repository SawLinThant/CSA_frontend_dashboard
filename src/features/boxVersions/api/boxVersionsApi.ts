import { authedDelete, authedGetJson, authedPatchJson, authedPostJson } from "@/services/http/authedFetch"

export interface BoxVersionListItem {
  id: string
  boxId: string
  versionName: string
  startDate: string
  endDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ListBoxVersionsResponse {
  items: BoxVersionListItem[]
  total: number
  page: number
  limit: number
}

export async function listBoxVersions(params: {
  page: number
  limit: number
  boxId?: string
}): Promise<ListBoxVersionsResponse> {
  return await authedGetJson<ListBoxVersionsResponse>("/auth/admin/box-versions", {
    page: params.page,
    limit: params.limit,
    boxId: params.boxId,
  })
}

export interface BoxItemListItem {
  id: string
  boxVersionId: string
  productId: string
  farmerId: string
  quantity: number
  optional: boolean
  createdAt?: string
  updatedAt?: string
}

export async function listBoxVersionItems(versionId: string): Promise<BoxItemListItem[]> {
  return await authedGetJson<BoxItemListItem[]>(`/auth/admin/box-versions/${versionId}/items`)
}

export interface CreateBoxVersionInput {
  boxId: string
  versionName: string
  startDate: string // YYYY-MM-DD
  endDate?: string | null
}

export async function createBoxVersion(input: CreateBoxVersionInput): Promise<BoxVersionListItem> {
  return await authedPostJson<BoxVersionListItem>("/auth/admin/box-versions", input)
}

export interface UpdateBoxVersionInput {
  versionName?: string
  startDate?: string
  endDate?: string | null
}

export async function updateBoxVersion(
  id: string,
  input: UpdateBoxVersionInput,
): Promise<BoxVersionListItem> {
  return await authedPatchJson<BoxVersionListItem>(`/auth/admin/box-versions/${id}`, input)
}

export async function deleteBoxVersion(id: string): Promise<void> {
  await authedDelete(`/auth/admin/box-versions/${id}`)
}

