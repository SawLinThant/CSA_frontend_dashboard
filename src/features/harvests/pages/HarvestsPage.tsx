import { useMemo, useState } from "react"
import { toast } from "sonner"

import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import { Button } from "@/components/ui/button"

import {
  approveHarvest,
  listHarvests,
  rejectHarvest,
  type HarvestItem,
} from "../api/harvestsApi"

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString()
}

function StatusBadge({ status }: { status: HarvestItem["status"] }) {
  const cls =
    status === "approved"
      ? "bg-emerald-100 text-emerald-800"
      : status === "rejected"
        ? "bg-rose-100 text-rose-800"
        : "bg-amber-100 text-amber-800"

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function HarvestsPage() {
  const [refreshToken, setRefreshToken] = useState(0)
  const [loadingApproveId, setLoadingApproveId] = useState<string | null>(null)
  const [loadingRejectId, setLoadingRejectId] = useState<string | null>(null)

  const columns: ColumnDef<HarvestItem>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Harvest ID",
        cell: (row: HarvestItem) => row.id,
        className: "w-[140px] text-xs text-muted-foreground"
      },
      {
        key: "farmerId",
        header: "Farmer ID",
        cell: (row: HarvestItem) => row.farmerId,
        className: "w-[140px] text-xs text-muted-foreground"
      },
      {
        key: "productId",
        header: "Product ID",
        cell: (row: HarvestItem) => row.productId,
        className: "w-[140px] text-xs text-muted-foreground"
      },
      {
        key: "quantityAvailable",
        header: "Quantity",
        cell: (row: HarvestItem) => row.quantityAvailable,
        className: "w-[140px] text-xs text-muted-foreground"
      },
      {
        key: "unitPrice",
        header: "Unit Price",
        cell: (row: HarvestItem) => `$${row.unitPrice.toFixed(2)}`,
        className: "w-[140px] text-xs text-muted-foreground"
      },
      {
        key: "harvestDate",
        header: "Harvest Date",
        cell: (row: HarvestItem) => formatDate(row.harvestDate),
        className: "w-[140px] text-xs text-muted-foreground"
      },
      {
        key: "availableUntil",
        header: "Available Until",
        cell: (row: HarvestItem) => formatDate(row.availableUntil),
        className: "w-[140px] text-xs text-muted-foreground"
      },
      {
        key: "status",
        header: "Status",
        cell: (row: HarvestItem) => <StatusBadge status={row.status} />,
        className: "w-[140px] text-xs text-muted-foreground"
      },
      {
        key: "actions",
        header: "Actions",
        className: "w-[140px] text-xs text-muted-foreground",
        cell: (row: HarvestItem) => {
          const isPending = row.status === "pending"
          const approving = loadingApproveId === row.id
          const rejecting = loadingRejectId === row.id

          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    setLoadingApproveId(row.id)
                    await approveHarvest(row.id)
                    toast.success("Harvest approved")
                    setRefreshToken((v) => v + 1)
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Failed to approve harvest",
                    )
                  } finally {
                    setLoadingApproveId(null)
                  }
                }}
                disabled={!isPending || approving || rejecting}
              >
                {approving ? "Approving..." : "Approve"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  try {
                    setLoadingRejectId(row.id)
                    await rejectHarvest(row.id)
                    toast.success("Harvest rejected")
                    setRefreshToken((v) => v + 1)
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Failed to reject harvest",
                    )
                  } finally {
                    setLoadingRejectId(null)
                  }
                }}
                disabled={!isPending || approving || rejecting}
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          )
        },
      },
    ],
    [loadingApproveId, loadingRejectId],
  )

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl text-muted-foreground font-semibold tracking-tight">Harvests</h1>
        <p className="text-sm text-muted-foreground">
          Review pending harvest submissions and approve or reject them.
        </p>
      </div>

      <PaginatedTable<HarvestItem>
        columns={columns}
        fetchPage={({ page, limit }) => listHarvests({ page, limit })}
        initialLimit={20}
        refreshToken={refreshToken}
        rowKey={(row) => row.id}
      />
    </div>
  )
}

