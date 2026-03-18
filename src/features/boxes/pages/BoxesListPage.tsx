import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import type { BoxListItem } from "@/features/boxes/api/boxesApi"
import { deleteBox, listBoxes } from "@/features/boxes/api/boxesApi"
import { BoxUpsertDialog } from "@/features/boxes/components/BoxUpsertDialog"
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

const FALLBACK_SRC = "/images/box_placeholder.jpg"

function BoxImage({ src }: { src?: string | null }) {
  const [broken, setBroken] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const resolved = !broken && src ? src : FALLBACK_SRC
  return (
    <div className="relative h-10 w-14">
      {!loaded && (
        <Skeleton className="absolute inset-0 h-10 w-14 rounded-md border" />
      )}
      <img
        src={resolved}
        alt=""
        className="h-10 w-14 rounded-md border object-cover"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setBroken(true)
          setLoaded(true)
        }}
      />
    </div>
  )
}

export default function BoxesListPage() {
  const [refreshToken, setRefreshToken] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<BoxListItem | null>(null)

  const fetchPage = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listBoxes({ page, limit })
  }, [])

  const columns: ColumnDef<BoxListItem>[] = useMemo(
    () => [
      {
        key: "image",
        header: "Image",
        className: "w-[90px]",
        cell: (r) => <BoxImage src={r.imageUrl} />,
      },
      { key: "name", header: "Name", cell: (r) => r.name , className: "w-[140px] text-xs text-muted-foreground"},
      { key: "active", header: "Active", cell: (r) => (r.isActive ? "Yes" : "No") , className: "w-[140px] text-xs text-muted-foreground"},
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
                  <AlertDialogTitle>Delete box?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void deleteBox(r.id)
                        .then(() => {
                          toast.success("Box deleted")
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
        <h1 className="text-2xl font-semibold text-muted-foreground">Boxes</h1>
        <Button onClick={() => setCreateOpen(true)}>New box</Button>
      </div>

      <PaginatedTable
        columns={columns}
        fetchPage={fetchPage}
        rowKey={(r) => r.id}
        refreshToken={refreshToken}
      />

      <BoxUpsertDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => setRefreshToken((v) => v + 1)}
      />

      <BoxUpsertDialog
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

