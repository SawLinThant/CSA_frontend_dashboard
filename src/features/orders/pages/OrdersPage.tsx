import { useCallback, useMemo, useState } from "react"
import { NavLink } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import { adminListOrders, type AdminOrderListItem } from "@/features/orders/api/ordersApi"

function moneyLabel(v: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v)
  } catch {
    return String(v)
  }
}

function dateLabel(iso: string | null) {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString()
}

function orderStatusBadge(status: AdminOrderListItem["status"]) {
  if (status === "delivered") return <Badge variant="default">delivered</Badge>
  if (status === "cancelled") return <Badge variant="destructive">cancelled</Badge>
  if (status === "packed") return <Badge variant="secondary">packed</Badge>
  if (status === "shipped") return <Badge variant="secondary">shipped</Badge>
  return <Badge variant="outline">processing</Badge>
}

function deliveryBadge(row: AdminOrderListItem) {
  const s = row.delivery?.status ?? null
  if (!s) return <Badge variant="outline">none</Badge>
  if (s === "delivered") return <Badge variant="default">delivered</Badge>
  if (s === "failed") return <Badge variant="destructive">failed</Badge>
  if (s === "out_for_delivery") return <Badge variant="secondary">out_for_delivery</Badge>
  return <Badge variant="outline">scheduled</Badge>
}

function computeDelayReason(row: AdminOrderListItem): string | null {
  const targetIso = row.deliveryDate ?? row.cycleDate
  if (!targetIso) return null
  const target = new Date(targetIso)
  if (Number.isNaN(target.getTime())) return null
  const delivered = row.delivery?.status === "delivered" || row.status === "delivered"
  if (delivered) return null
  if (Date.now() <= target.getTime()) return null

  if (row.delivery?.status === "out_for_delivery") return "Driver delay / route delay."
  if (row.status === "pending") return "Packing is taking longer than expected."
  if (row.status === "packed" && row.delivery?.status === "scheduled") return "Awaiting dispatch."
  return "Delivery delayed."
}

export default function OrdersPage() {
  const [refreshToken] = useState(0)
  const [search, setSearch] = useState("")

  const fetchPage = useCallback(
    ({ page, limit }: { page: number; limit: number }) => {
      return adminListOrders({
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
      })
    },
    [search],
  )

  const columns: ColumnDef<AdminOrderListItem>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Order",
        cell: (r) => (
          <NavLink
            to={`/orders/${encodeURIComponent(r.id)}`}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {r.id}
          </NavLink>
        ),
        className: "w-[220px] text-xs",
      },
      { key: "customer", header: "Customer", cell: (r) => r.customer.user.email ?? r.customer.user.name, className: "text-xs text-muted-foreground" },
      { key: "box", header: "Box", cell: (r) => r.box.name, className: "text-xs text-muted-foreground" },
      { key: "status", header: "Order status", cell: (r) => orderStatusBadge(r.status), className: "text-xs" },
      { key: "delivery", header: "Delivery", cell: (r) => deliveryBadge(r), className: "text-xs" },
      { key: "deliveryDate", header: "Target", cell: (r) => dateLabel(r.deliveryDate ?? r.cycleDate), className: "text-xs text-muted-foreground" },
      {
        key: "delay",
        header: "Delay",
        cell: (r) => {
          const reason = computeDelayReason(r)
          return reason ? <span className="text-xs text-amber-700">{reason}</span> : <span className="text-xs text-muted-foreground">—</span>
        },
        className: "max-w-[260px]",
      },
      { key: "totalPrice", header: "Total", cell: (r) => moneyLabel(r.totalPrice), className: "text-xs text-muted-foreground text-right" },
      { key: "createdAt", header: "Created", cell: (r) => dateLabel(r.createdAt), className: "text-xs text-muted-foreground" },
    ],
    [],
  )

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-muted-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">View subscription-generated orders and delivery targets.</p>
        </div>
        <div className="w-full max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order id, box name, tracking code, customer email..."
          />
        </div>
      </div>

      <PaginatedTable
        columns={columns}
        fetchPage={fetchPage}
        rowKey={(r) => r.id}
        refreshToken={refreshToken}
      />
    </div>
  )
}

