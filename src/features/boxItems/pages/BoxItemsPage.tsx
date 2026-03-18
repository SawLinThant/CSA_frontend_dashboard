import { useCallback, useEffect, useMemo, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BoxVersionListItem, BoxItemListItem } from "@/features/boxVersions/api/boxVersionsApi"
import { listBoxVersions, listBoxVersionItems } from "@/features/boxVersions/api/boxVersionsApi"
import type { BoxItem } from "@/features/boxItems/api/boxItemsApi"
import { deleteBoxItem } from "@/features/boxItems/api/boxItemsApi"
import { BoxItemUpsertDialog } from "@/features/boxItems/components/BoxItemUpsertDialog"
import { listProductsAuthed } from "@/features/products/api/listProducts"
import { listFarmers } from "@/features/farmers/api/listFarmers"

export default function BoxItemsPage() {
  const [refreshToken, setRefreshToken] = useState(0)
  const [selectedVersionId, setSelectedVersionId] = useState<string>("")

  const [versions, setVersions] = useState<BoxVersionListItem[]>([])
  const [productNameById, setProductNameById] = useState<Record<string, string>>({})
  const [farmerNameById, setFarmerNameById] = useState<Record<string, string>>({})

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<BoxItem | null>(null)

  useEffect(() => {
    void listProductsAuthed({ page: 1, limit: 100 })
      .then((res) => {
        const map: Record<string, string> = {}
        for (const p of res.items) map[p.id] = p.name
        setProductNameById(map)
      })
      .catch(() => {
        setProductNameById({})
      })
  }, [])

  useEffect(() => {
    void listFarmers({ page: 1, limit: 100 })
      .then((res) => {
        const map: Record<string, string> = {}
        for (const f of res.items) map[f.id] = f.user.name
        setFarmerNameById(map)
      })
      .catch(() => {
        setFarmerNameById({})
      })
  }, [])

  const fetchVersions = useCallback(() => {
    return listBoxVersions({ page: 1, limit: 100 }).then((res) => {
      setVersions(res.items)
      if (!selectedVersionId && res.items.length) setSelectedVersionId(res.items[0].id)
      return res
    })
  }, [selectedVersionId])

  const fetchItems = useCallback(async ({ page, limit }: { page: number; limit: number }) => {
    // PaginatedTable contract requires page/limit, but this endpoint is not paginated.
    // We fetch by selectedVersionId and map into the same shape.
    if (!versions.length) {
      await fetchVersions()
    }
    if (!selectedVersionId) {
      return { items: [], total: 0, page, limit }
    }
    const items = await listBoxVersionItems(selectedVersionId)
    return { items, total: items.length, page: 1, limit: items.length || 1 }
  }, [selectedVersionId, versions.length, fetchVersions])

  const selectedVersionName = useMemo(() => {
    if (!selectedVersionId) return ""
    return versions.find((v) => v.id === selectedVersionId)?.versionName ?? ""
  }, [versions, selectedVersionId])

  const columns: ColumnDef<BoxItemListItem>[] = useMemo(
    () => [
      { key: "id", header: "ID", cell: (r) => r.id, className: "w-[140px] text-xs text-muted-foreground" },
      {
        key: "productId",
        header: "Product",
        cell: (r) => productNameById[r.productId] ?? r.productId,
        className: "w-[220px] text-xs text-muted-foreground",
      },
      {
        key: "farmerId",
        header: "Farmer",
        cell: (r) => farmerNameById[r.farmerId] ?? r.farmerId,
        className: "w-[220px] text-xs text-muted-foreground",
      },
      { key: "quantity", header: "Qty", cell: (r) => r.quantity, className: "w-[140px] text-xs text-muted-foreground" },
      { key: "optional", header: "Optional", cell: (r) => (r.optional ? "Yes" : "No") , className: "w-[140px] text-xs text-muted-foreground"},
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
                setEditing(r as unknown as BoxItem)
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
                  <AlertDialogTitle>Delete box item?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void deleteBoxItem(r.id)
                        .then(() => {
                          toast.success("Box item deleted")
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
    [productNameById, farmerNameById],
  )

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-muted-foreground">Box Items</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void fetchVersions()}>
            Refresh versions
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={!selectedVersionId}>
            New item
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Version</span>
        <Select
          value={selectedVersionId}
          onValueChange={(v) => {
            setSelectedVersionId(v ?? "")
            setRefreshToken((x) => x + 1)
          }}
        >
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Select a version">
              {selectedVersionName}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {versions.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.versionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PaginatedTable
        columns={columns}
        fetchPage={fetchItems}
        rowKey={(r) => r.id}
        refreshToken={refreshToken}
      />

      <BoxItemUpsertDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        presetBoxVersionId={selectedVersionId}
        onSuccess={() => setRefreshToken((v) => v + 1)}
      />

      <BoxItemUpsertDialog
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

