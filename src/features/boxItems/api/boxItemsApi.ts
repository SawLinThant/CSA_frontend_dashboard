import { authedDelete, authedGetJson, authedPatchJson, authedPostJson } from "@/services/http/authedFetch"

export interface BoxItem {
  id: string
  boxVersionId: string
  productId: string
  farmerId: string
  quantity: number
  optional: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateBoxItemInput {
  boxVersionId: string
  productId: string
  farmerId: string
  quantity: number
  optional: boolean
}

export async function createBoxItem(input: CreateBoxItemInput): Promise<BoxItem> {
  return await authedPostJson<BoxItem>("/auth/admin/box-items", input)
}

export interface UpdateBoxItemInput {
  quantity?: number
  optional?: boolean
}

export async function updateBoxItem(id: string, input: UpdateBoxItemInput): Promise<BoxItem> {
  return await authedPatchJson<BoxItem>(`/auth/admin/box-items/${id}`, input)
}

export async function deleteBoxItem(id: string): Promise<void> {
  await authedDelete(`/auth/admin/box-items/${id}`)
}

export async function getBoxItem(id: string): Promise<BoxItem> {
  return await authedGetJson<BoxItem>(`/auth/admin/box-items/${id}`)
}

