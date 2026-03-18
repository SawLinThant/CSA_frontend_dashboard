import { authedDelete, authedGetJson, authedPatchFormData, authedPatchJson, authedPostFormData } from "@/services/http/authedFetch"

export interface BoxListItem {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ListBoxesResponse {
  items: BoxListItem[]
  total: number
  page: number
  limit: number
}

export async function listBoxes(params: {
  page: number
  limit: number
  name?: string
  isActive?: boolean
}): Promise<ListBoxesResponse> {
  return await authedGetJson<ListBoxesResponse>("/auth/admin/boxes", {
    page: params.page,
    limit: params.limit,
    name: params.name,
    isActive: params.isActive,
  })
}

export interface CreateBoxWithUploadInput {
  name: string
  description?: string | null
  isActive: boolean
  image: File
}

export async function createBoxWithUpload(input: CreateBoxWithUploadInput): Promise<BoxListItem> {
  const fd = new FormData()
  fd.set("name", input.name)
  if (input.description !== undefined) fd.set("description", input.description ?? "")
  fd.set("isActive", String(input.isActive))
  fd.set("image", input.image)

  return await authedPostFormData<BoxListItem>("/auth/admin/boxes/upload", fd)
}

export interface UpdateBoxWithUploadInput {
  name: string
  description?: string | null
  isActive: boolean
  image?: File | null
}

export async function updateBoxWithUpload(
  boxId: string,
  input: UpdateBoxWithUploadInput,
): Promise<BoxListItem> {
  const fd = new FormData()
  fd.set("name", input.name)
  if (input.description !== undefined) fd.set("description", input.description ?? "")
  fd.set("isActive", String(input.isActive))
  if (input.image instanceof File) fd.set("image", input.image)

  return await authedPatchFormData<BoxListItem>(`/auth/admin/boxes/${boxId}/upload`, fd)
}

export interface UpdateBoxInput {
  name?: string
  description?: string | null
  imageUrl?: string | null
  isActive?: boolean
}

export async function updateBox(boxId: string, input: UpdateBoxInput): Promise<BoxListItem> {
  return await authedPatchJson<BoxListItem>(`/auth/admin/boxes/${boxId}`, input)
}

export async function deleteBox(boxId: string): Promise<void> {
  await authedDelete(`/auth/admin/boxes/${boxId}`)
}

