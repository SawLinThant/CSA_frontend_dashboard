import { useEffect, useMemo, useState } from "react"
import { useParams, NavLink } from "react-router-dom"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  adminGetOrder,
  adminUpdateOrderStatus,
  adminUpsertDelivery,
  type AdminOrderDetail,
  type DeliveryStatus,
  type OrderStatus,
} from "@/features/orders/api/ordersApi"

function dateLabel(iso: string | null) {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString()
}

function orderStatusLabel(status: AdminOrderDetail["status"]) {
  if (status === "pending") return "Processing"
  if (status === "shipped") return "In transit"
  return status
}

function computeDelayReason(order: AdminOrderDetail): string | null {
  const targetIso = order.deliveryDate ?? order.cycleDate
  if (!targetIso) return null
  const target = new Date(targetIso)
  if (Number.isNaN(target.getTime())) return null
  const delivered = order.delivery?.deliveryStatus === "delivered" || order.status === "delivered"
  if (delivered) return null
  if (Date.now() <= target.getTime()) return null

  if (order.delivery?.deliveryStatus === "out_for_delivery") return "Driver delay / route delay."
  if (order.status === "pending") return "Packing is taking longer than expected."
  if (order.status === "packed" && order.delivery?.deliveryStatus === "scheduled") return "Awaiting dispatch."
  return "Delivery delayed."
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [nextOrderStatus, setNextOrderStatus] = useState<OrderStatus>("pending")
  const [nextDeliveryStatus, setNextDeliveryStatus] = useState<DeliveryStatus>("scheduled")
  const [nextDriver, setNextDriver] = useState("")
  const [nextTracking, setNextTracking] = useState("")
  const [nextDeliveredAt, setNextDeliveredAt] = useState("")

  useEffect(() => {
    let cancelled = false
    if (!id) return
    setLoading(true)
    setError(null)
    void adminGetOrder(id)
      .then((res) => {
        if (cancelled) return
        setOrder(res)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load order")
        setOrder(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!order) return
    setNextOrderStatus(order.status)
    setNextDeliveryStatus(order.delivery?.deliveryStatus ?? "scheduled")
    setNextDriver(order.delivery?.deliveryDriver ?? "")
    setNextTracking(order.delivery?.trackingCode ?? "")
    setNextDeliveredAt(order.delivery?.deliveredAt ?? "")
  }, [order])

  const delayReason = useMemo(() => (order ? computeDelayReason(order) : null), [order])

  if (loading && !order) {
    return <div className="p-4 text-sm text-muted-foreground">Loading…</div>
  }

  if (error || !order) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">{error ?? "Order not found"}</p>
        <NavLink to="/orders" className="mt-3 inline-block text-sm underline underline-offset-2">
          Back to orders
        </NavLink>
      </div>
    )
  }

  async function refresh() {
    if (!id) return
    const res = await adminGetOrder(id)
    setOrder(res)
  }

  async function saveUpdates() {
    if (!id) return
    setSaving(true)
    try {
      await adminUpdateOrderStatus(id, nextOrderStatus)

      const deliveredAt =
        nextDeliveredAt.trim() ? new Date(nextDeliveredAt).toISOString() : null
      if (nextDeliveryStatus === "delivered" && !deliveredAt) {
        throw new Error("Delivered at is required when delivery status is delivered.")
      }

      await adminUpsertDelivery(id, {
        deliveryStatus: nextDeliveryStatus,
        deliveryDriver: nextDriver.trim() ? nextDriver.trim() : null,
        trackingCode: nextTracking.trim() ? nextTracking.trim() : null,
        deliveredAt,
      })

      toast.success("Order updated")
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update order")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <NavLink to="/orders" className="text-sm text-muted-foreground underline underline-offset-2">
            Back to orders
          </NavLink>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-muted-foreground">Order</h1>
            <span className="text-xs text-muted-foreground">{order.id}</span>
            <Badge variant="outline">{orderStatusLabel(order.status)}</Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Update status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Order status</div>
            <Select value={nextOrderStatus} onValueChange={(v) => setNextOrderStatus(v as OrderStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Order status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Processing</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Delivery status</div>
            <Select value={nextDeliveryStatus} onValueChange={(v) => setNextDeliveryStatus(v as DeliveryStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Delivery status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Driver (optional)</div>
            <Input value={nextDriver} onChange={(e) => setNextDriver(e.target.value)} placeholder="Driver name" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Tracking code (optional)</div>
            <Input value={nextTracking} onChange={(e) => setNextTracking(e.target.value)} placeholder="Tracking code" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-xs font-medium text-muted-foreground">
              Delivered at (ISO, required only when Delivered)
            </div>
            <Input
              value={nextDeliveredAt}
              onChange={(e) => setNextDeliveredAt(e.target.value)}
              placeholder="e.g. 2026-04-02T14:30:00.000Z"
            />
          </div>

          <div className="flex items-center justify-end gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={() => refresh()} disabled={saving}>
              Refresh
            </Button>
            <Button type="button" onClick={saveUpdates} disabled={saving}>
              {saving ? "Updating..." : "Update"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {delayReason ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span className="font-semibold">Delayed.</span> {delayReason}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div>{order.customer.user.name}</div>
            <div>{order.customer.user.email ?? "-"}</div>
            <div>{order.customer.user.phone}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div>Status: {order.delivery?.deliveryStatus ?? "—"}</div>
            <div>Driver: {order.delivery?.deliveryDriver ?? "—"}</div>
            <div>Tracking: {order.delivery?.trackingCode ?? "—"}</div>
            <div>Target: {dateLabel(order.deliveryDate ?? order.cycleDate)}</div>
            <div>Delivered at: {dateLabel(order.delivery?.deliveredAt ?? null)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Box</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <div>{order.box.name}</div>
          <div className="text-xs">{order.boxVersion.versionName}</div>
        </CardContent>
      </Card>
    </div>
  )
}

