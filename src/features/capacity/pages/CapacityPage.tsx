import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import type { CapacitySnapshot, CapacityStatus, InventoryReservation } from "@/features/capacity/api/capacityApi"
import { listCapacitySnapshots, listInventoryReservations, updateCapacitySnapshotStatus } from "@/features/capacity/api/capacityApi"

function statusBadge(value: string) {
  return <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">{value}</span>
}

export default function CapacityPage() {
  const [snapshotRefreshToken, setSnapshotRefreshToken] = useState(0)
  const [reservationRefreshToken] = useState(0)

  const fetchSnapshots = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listCapacitySnapshots({ page, limit })
  }, [])

  const fetchReservations = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listInventoryReservations({ page, limit })
  }, [])

  const snapshotColumns: ColumnDef<CapacitySnapshot>[] = useMemo(
    () => [
      {
        key: "boxVersionId",
        header: "Box Version",
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground">{r.boxVersionName ?? r.boxVersionId}</span>
            {r.boxVersionName ? (
              <span className="text-[10px] text-muted-foreground tabular-nums">{r.boxVersionId}</span>
            ) : null}
          </div>
        ),
        className: "text-xs text-muted-foreground",
      },
      { key: "cycleDate", header: "Cycle Date", cell: (r) => new Date(r.cycleDate).toLocaleDateString(), className: "text-xs text-muted-foreground" },
      { key: "max", header: "Max", cell: (r) => r.maxBoxes, className: "text-xs text-muted-foreground" },
      { key: "reserved", header: "Reserved", cell: (r) => r.reservedBoxes, className: "text-xs text-muted-foreground" },
      { key: "consumed", header: "Consumed", cell: (r) => r.consumedBoxes, className: "text-xs text-muted-foreground" },
      { key: "status", header: "Status", cell: (r) => statusBadge(r.status), className: "text-xs text-muted-foreground" },
      {
        key: "actions",
        header: "",
        className: "text-right",
        cell: (r) => (
          <div className="flex items-center justify-end gap-2">
            {(["open", "locked", "closed"] as CapacityStatus[]).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={r.status === status ? "default" : "outline"}
                onClick={() => {
                  void updateCapacitySnapshotStatus(r.id, status)
                    .then(() => {
                      toast.success(`Snapshot set to ${status}`)
                      setSnapshotRefreshToken((v) => v + 1)
                    })
                    .catch((e) => toast.error(e instanceof Error ? e.message : "Status update failed"))
                }}
              >
                {status}
              </Button>
            ))}
          </div>
        ),
      },
    ],
    [],
  )

  const reservationColumns: ColumnDef<InventoryReservation>[] = useMemo(
    () => [
      { key: "id", header: "Reservation", cell: (r) => r.id, className: "text-xs text-muted-foreground" },
      { key: "subscriptionId", header: "Subscription", cell: (r) => r.subscriptionId, className: "text-xs text-muted-foreground" },
      { key: "boxVersionId", header: "Box Version", cell: (r) => r.boxVersionId, className: "text-xs text-muted-foreground" },
      { key: "cycleDate", header: "Cycle Date", cell: (r) => new Date(r.cycleDate).toLocaleDateString(), className: "text-xs text-muted-foreground" },
      { key: "qty", header: "Qty", cell: (r) => r.quantity, className: "text-xs text-muted-foreground" },
      { key: "status", header: "Status", cell: (r) => statusBadge(r.status), className: "text-xs text-muted-foreground" },
    ],
    [],
  )

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-muted-foreground">Capacity Control</h1>
        <p className="text-sm text-muted-foreground">
          Monitor capacity snapshots and reservation processing for the order worker flow.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-muted-foreground">Capacity Snapshots</h2>
        <PaginatedTable
          columns={snapshotColumns}
          fetchPage={fetchSnapshots}
          rowKey={(r) => r.id}
          refreshToken={snapshotRefreshToken}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-muted-foreground">Inventory Reservations</h2>
        <PaginatedTable
          columns={reservationColumns}
          fetchPage={fetchReservations}
          rowKey={(r) => r.id}
          refreshToken={reservationRefreshToken}
        />
      </section>
    </div>
  )
}

