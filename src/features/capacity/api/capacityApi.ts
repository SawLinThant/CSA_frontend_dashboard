import { authedGetJson, authedPatchJson, authedPostJson } from "@/services/http/authedFetch"

export type CapacityStatus = "open" | "locked" | "closed"
export type ReservationStatus = "reserved" | "consumed" | "released" | "expired"

export interface CapacitySnapshot {
  id: string
  boxVersionId: string
  /** Present on list responses; omitted on single-snapshot PATCH/recompute responses. */
  boxVersionName?: string
  cycleDate: string
  maxBoxes: number
  reservedBoxes: number
  consumedBoxes: number
  status: CapacityStatus
  createdAt: string
  updatedAt: string
}

export interface InventoryReservation {
  id: string
  subscriptionId: string
  boxVersionId: string
  capacitySnapshotId: string
  cycleDate: string
  quantity: number
  status: ReservationStatus
  reason?: string | null
  idempotencyKey: string
  createdAt: string
  updatedAt: string
}

export interface ListCapacitySnapshotsResponse {
  items: CapacitySnapshot[]
  total: number
  page: number
  limit: number
}

export interface ListInventoryReservationsResponse {
  items: InventoryReservation[]
  total: number
  page: number
  limit: number
}

export async function recomputeBoxVersionCapacity(boxVersionId: string, cycleDate: string) {
  return await authedPostJson<{ snapshot: CapacitySnapshot }>(
    `/auth/admin/box-versions/${boxVersionId}/capacity/recompute`,
    { cycleDate },
  )
}

export async function listCapacitySnapshots(params: {
  page: number
  limit: number
  boxVersionId?: string
  status?: CapacityStatus
}): Promise<ListCapacitySnapshotsResponse> {
  return await authedGetJson<ListCapacitySnapshotsResponse>("/auth/admin/capacity-snapshots", params)
}

export async function updateCapacitySnapshotStatus(snapshotId: string, status: CapacityStatus): Promise<CapacitySnapshot> {
  return await authedPatchJson<CapacitySnapshot>(`/auth/admin/capacity-snapshots/${snapshotId}/status`, { status })
}

export async function listInventoryReservations(params: {
  page: number
  limit: number
  status?: ReservationStatus
}): Promise<ListInventoryReservationsResponse> {
  return await authedGetJson<ListInventoryReservationsResponse>("/auth/admin/inventory-reservations", params)
}

