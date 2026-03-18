import { authedDelete, authedGetJson, authedPatchJson, authedPostJson } from "@/services/http/authedFetch"

export type DeliveryFrequency = "weekly" | "monthly"

export interface SubscriptionPlan {
  id: string
  boxId: string
  name: string
  price: number
  deliveryFrequency: DeliveryFrequency
  deliveriesPerCycle: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ListSubscriptionPlansResponse {
  items: SubscriptionPlan[]
  total: number
  page: number
  limit: number
}

export async function listSubscriptionPlans(params: {
  page: number
  limit: number
  boxId?: string
  active?: boolean
}): Promise<ListSubscriptionPlansResponse> {
  return await authedGetJson<ListSubscriptionPlansResponse>("/auth/admin/subscription-plans", {
    page: params.page,
    limit: params.limit,
    boxId: params.boxId,
    active: params.active,
  })
}

export async function getSubscriptionPlan(id: string): Promise<SubscriptionPlan> {
  return await authedGetJson<SubscriptionPlan>(`/auth/admin/subscription-plans/${id}`)
}

export interface CreateSubscriptionPlanInput {
  boxId: string
  name: string
  price: number
  deliveryFrequency: DeliveryFrequency
  deliveriesPerCycle: number
  active: boolean
}

export async function createSubscriptionPlan(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
  return await authedPostJson<SubscriptionPlan>("/auth/admin/subscription-plans", input)
}

export interface UpdateSubscriptionPlanInput {
  name?: string
  price?: number
  deliveryFrequency?: DeliveryFrequency
  deliveriesPerCycle?: number
  active?: boolean
}

export async function updateSubscriptionPlan(id: string, input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan> {
  return await authedPatchJson<SubscriptionPlan>(`/auth/admin/subscription-plans/${id}`, input)
}

export async function deleteSubscriptionPlan(id: string): Promise<void> {
  await authedDelete(`/auth/admin/subscription-plans/${id}`)
}

