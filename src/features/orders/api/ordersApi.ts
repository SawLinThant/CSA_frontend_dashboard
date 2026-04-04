import { authedGetJson, authedPatchJson, type PaginatedResult } from "@/services/http/authedFetch"

export type OrderStatus = "pending" | "packed" | "shipped" | "delivered" | "cancelled"
export type DeliveryStatus = "scheduled" | "out_for_delivery" | "delivered" | "failed"

export interface AdminCustomerAddress {
  id: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface AdminOrderListItem {
  id: string
  status: OrderStatus
  totalPrice: number
  cycleDate: string | null
  deliveryDate: string | null
  createdAt: string
  customer: {
    id: string
    user: {
      id: string
      email: string | null
      name: string
    }
  }
  box: {
    id: string
    name: string
    imageUrl: string | null
  }
  boxVersion: {
    id: string
    versionName: string
  }
  subscription: {
    id: string
    plan: {
      id: string
      name: string
    }
  } | null
  delivery: {
    status: DeliveryStatus
    trackingCode: string | null
    deliveryDriver: string | null
    deliveredAt: string | null
  } | null
}

export type AdminListOrdersResponse = PaginatedResult<AdminOrderListItem> & {
  totalPages: number
}

export interface AdminOrderDetail extends Omit<AdminOrderListItem, "boxVersion" | "delivery" | "box"> {
  box: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
  }
  boxVersion: {
    id: string
    versionName: string
    startDate: string
    endDate: string | null
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    lineTotal: number
    product: { id: string; name: string; unit: string | null }
    farmer: { id: string; farmName: string }
  }>
  payments: Array<{
    id: string
    amount: number
    paymentMethod: string
    paymentStatus: string
    transactionReference: string | null
    paidAt: string | null
  }>
  customer: {
    id: string
    user: {
      id: string
      email: string | null
      name: string
      phone: string
      addresses: AdminCustomerAddress[]
    }
  }
  delivery: {
    deliveryStatus: DeliveryStatus
    deliveryDriver: string | null
    trackingCode: string | null
    deliveredAt: string | null
  } | null
  subscription: {
    id: string
    status: string
    plan: {
      id: string
      name: string
      price: number
      deliveryFrequency: "weekly" | "monthly"
    }
  } | null
}

export async function adminListOrders(params: {
  page: number
  limit: number
  search?: string
  status?: OrderStatus
  statuses?: string
  sortBy?: "createdAt" | "totalPrice"
  sortOrder?: "asc" | "desc"
}): Promise<AdminListOrdersResponse> {
  return await authedGetJson<AdminListOrdersResponse>("/auth/admin/orders", params)
}

export async function adminGetOrder(orderId: string): Promise<AdminOrderDetail> {
  return await authedGetJson<AdminOrderDetail>(`/auth/admin/orders/${encodeURIComponent(orderId)}`)
}

export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<{ id: string; status: OrderStatus }> {
  return await authedPatchJson<{ id: string; status: OrderStatus }>(
    `/auth/admin/orders/${encodeURIComponent(orderId)}/status`,
    { status },
  )
}

export async function adminUpsertDelivery(
  orderId: string,
  input: {
    deliveryStatus: DeliveryStatus
    deliveryDriver?: string | null
    trackingCode?: string | null
    deliveredAt?: string | null
  },
): Promise<{
  orderId: string
  deliveryStatus: DeliveryStatus
  deliveryDriver: string | null
  trackingCode: string | null
  deliveredAt: string | null
}> {
  return await authedPatchJson(
    `/auth/admin/orders/${encodeURIComponent(orderId)}/delivery`,
    input,
  )
}

