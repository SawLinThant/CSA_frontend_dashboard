import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import type { BoxVersionListItem } from "@/features/boxVersions/api/boxVersionsApi"
import { deleteBoxVersion, listBoxVersions } from "@/features/boxVersions/api/boxVersionsApi"
import { BoxVersionUpsertDialog } from "@/features/boxVersions/components/BoxVersionUpsertDialog"
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

export default function BoxVersionsListPage() {
  const [refreshToken, setRefreshToken] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<BoxVersionListItem | null>(null)

  const fetchPage = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listBoxVersions({ page, limit })
  }, [])

  const columns: ColumnDef<BoxVersionListItem>[] = useMemo(
    () => [
      { key: "id", header: "ID", cell: (r) => r.id, className: "w-[140px] text-xs text-muted-foreground" },
      { key: "name", header: "Version", cell: (r) => r.versionName, className: "w-[140px] text-xs text-muted-foreground"},
      { key: "start", header: "Start", cell: (r) => new Date(r.startDate).toLocaleDateString() , className: "w-[140px] text-xs text-muted-foreground"},
      { key: "end", header: "End", cell: (r) => (r.endDate ? new Date(r.endDate).toLocaleDateString() : "-") , className: "w-[140px] text-xs text-muted-foreground"},
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
                  <AlertDialogTitle>Delete box version?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void deleteBoxVersion(r.id)
                        .then(() => {
                          toast.success("Box version deleted")
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-muted-foreground">Box Versions</h1>
        <Button onClick={() => setCreateOpen(true)}>New version</Button>
      </div>

      <PaginatedTable
        columns={columns}
        fetchPage={fetchPage}
        rowKey={(r) => r.id}
        refreshToken={refreshToken}
      />

      <BoxVersionUpsertDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => setRefreshToken((v) => v + 1)}
      />

      <BoxVersionUpsertDialog
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

