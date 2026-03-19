import { authedGetJson, authedPatchJson } from "@/services/http/authedFetch"

export type HarvestStatus = "pending" | "approved" | "rejected"

export interface HarvestItem {
  id: string
  farmerId: string
  productId: string
  quantityAvailable: number
  unitPrice: number
  harvestDate: string
  availableUntil: string
  status: HarvestStatus
  approvedBy?: string | null
  approvedAt?: string | null
  createdAt: string
}

export interface ListHarvestsResponse {
  items: HarvestItem[]
  total: number
  page: number
  limit: number
}

export async function listHarvests(params: {
  page: number
  limit: number
  farmerId?: string
  productId?: string
  status?: HarvestStatus
  harvestDateFrom?: string
  harvestDateTo?: string
}): Promise<ListHarvestsResponse> {
  return await authedGetJson<ListHarvestsResponse>("/auth/admin/harvests", {
    page: params.page,
    limit: params.limit,
    farmerId: params.farmerId,
    productId: params.productId,
    status: params.status,
    harvestDateFrom: params.harvestDateFrom,
    harvestDateTo: params.harvestDateTo,
  })
}

export async function approveHarvest(id: string): Promise<HarvestItem> {
  return await authedPatchJson<HarvestItem>(`/auth/admin/harvests/${id}/approve`)
}

export async function rejectHarvest(id: string): Promise<HarvestItem> {
  return await authedPatchJson<HarvestItem>(`/auth/admin/harvests/${id}/reject`)
}

