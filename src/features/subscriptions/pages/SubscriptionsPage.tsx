import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { SubscriptionPlan } from "@/features/subscriptions/api/subscriptionPlansApi"
import { deleteSubscriptionPlan, listSubscriptionPlans } from "@/features/subscriptions/api/subscriptionPlansApi"
import { SubscriptionPlanUpsertDialog } from "@/features/subscriptions/components/SubscriptionPlanUpsertDialog"

export default function SubscriptionsPage() {
  const [refreshToken, setRefreshToken] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null)

  const fetchPage = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listSubscriptionPlans({ page, limit })
  }, [])

  const columns: ColumnDef<SubscriptionPlan>[] = useMemo(
    () => [
      { key: "id", header: "ID", cell: (r) => r.id, className: "w-[140px] text-xs text-muted-foreground" },
      { key: "name", header: "Name", cell: (r) => r.name, className: "w-[140px] text-xs text-muted-foreground" },
      { key: "price", header: "Price", cell: (r) => r.price, className: "w-[140px] text-xs text-muted-foreground" },
      { key: "freq", header: "Frequency", cell: (r) => r.deliveryFrequency, className: "w-[140px] text-xs text-muted-foreground" },
      { key: "dpc", header: "Deliveries/Cycle", cell: (r) => r.deliveriesPerCycle, className: "w-[140px] text-xs text-muted-foreground" },
      { key: "active", header: "Active", cell: (r) => (r.active ? "Yes" : "No") , className: "w-[140px] text-xs text-muted-foreground"},
      {
        key: "actions",
        header: "",
        className: "text-right w-[140px] text-xs text-muted-foreground",
        cell: (r) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(r)
                setEditOpen(true)
              }}
            >
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete subscription plan?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void deleteSubscriptionPlan(r.id)
                        .then(() => {
                          toast.success("Plan deleted")
                          setRefreshToken((v) => v + 1)
                        })
                        .catch((e) => toast.error(e instanceof Error ? e.message : "Delete failed"))
                    }}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-muted-foreground">Subscriptions</h1>
        <Button onClick={() => setCreateOpen(true)}>New plan</Button>
      </div>

      <PaginatedTable
        columns={columns}
        fetchPage={fetchPage}
        rowKey={(r) => r.id}
        refreshToken={refreshToken}
      />

      <SubscriptionPlanUpsertDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => setRefreshToken((v) => v + 1)}
      />

      <SubscriptionPlanUpsertDialog
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditing(null)
        }}
        initial={editing}
        onSuccess={() => setRefreshToken((v) => v + 1)}
      />
    </div>
  )
}

