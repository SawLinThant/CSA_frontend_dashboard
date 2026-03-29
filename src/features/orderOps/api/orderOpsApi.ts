import { authedGetJson } from "@/services/http/authedFetch"

export type CycleEventOutcome = "created" | "skipped" | "failed"

export interface FailedReasonCount {
  reason: string
  count: number
}

export interface SubscriptionOrderOpsSummary {
  referenceDate: string
  dueSubscriptions: number
  generatedOrders: number
  failedAttempts: {
    total: number
    byReason: FailedReasonCount[]
  }
  pausedCapacitySubscriptions: number
}

export interface SubscriptionOrderCycleEvent {
  id: string
  subscriptionId: string | null
  cycleDate: string | null
  referenceDate: string
  outcome: CycleEventOutcome
  reason: string | null
  attempt: number
  createdAt: string
}

export interface ListSubscriptionOrderCycleEventsResponse {
  items: SubscriptionOrderCycleEvent[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getSubscriptionOrderOpsSummary(params?: {
  from?: string
  to?: string
  referenceDate?: string
}): Promise<SubscriptionOrderOpsSummary> {
  return await authedGetJson<SubscriptionOrderOpsSummary>("/auth/admin/subscription-order-ops/summary", params)
}

export async function listSubscriptionOrderCycleEvents(params: {
  page: number
  limit: number
  outcome?: CycleEventOutcome
  reason?: string
  subscriptionId?: string
  from?: string
  to?: string
}): Promise<ListSubscriptionOrderCycleEventsResponse> {
  return await authedGetJson<ListSubscriptionOrderCycleEventsResponse>("/auth/admin/subscription-order-ops/events", params)
}

