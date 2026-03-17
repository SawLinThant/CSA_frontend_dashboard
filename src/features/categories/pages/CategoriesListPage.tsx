import { useCallback, useMemo, useState } from "react"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import { listCategories, type CategoryListItem } from "@/features/categories/api/listCategories"
import { createCategory } from "@/features/categories/api/createCategory"
import { updateCategory } from "@/features/categories/api/updateCategory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export default function CategoriesListPage() {
  const [refreshToken, setRefreshToken] = useState(0)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryListItem | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const fetchPage = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listCategories({ page, limit })
  }, [])

  const columns: ColumnDef<CategoryListItem>[] = useMemo(
    () => [
      { key: "id", header: "ID", cell: (r) => r.id, className: "w-[140px] text-xs text-muted-foreground" },
      { key: "name", header: "Name", cell: (r) => r.name, className: "w-[180px] text-xs text-muted-foreground" },
      {
        key: "description",
        header: "Description",
        cell: (r) => r.description ?? "-",
        className: "text-xs text-muted-foreground",
      },
      {
        key: "actions",
        header: "",
        className: "w-[120px] text-right",
        cell: (r) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(r)
                setEditName(r.name ?? "")
                setEditDescription(r.description ?? "")
                setEditError(null)
                setEditOpen(true)
              }}
            >
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) {
      setFormError("Name is required")
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      await createCategory({
        name: trimmed,
        description: description.trim() ? description.trim() : null,
      })
      setOpen(false)
      setName("")
      setDescription("")
      setRefreshToken((v) => v + 1)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Create failed")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditSave() {
    if (!editing) return
    const trimmed = editName.trim()
    if (!trimmed) {
      setEditError("Name is required")
      return
    }

    setEditSubmitting(true)
    setEditError(null)
    try {
      await updateCategory(editing.id, {
        name: trimmed,
        description: editDescription.trim() ? editDescription.trim() : null,
      })
      setEditOpen(false)
      setEditing(null)
      setRefreshToken((v) => v + 1)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Update failed")
    } finally {
      setEditSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-muted-foreground">Categories</h1>

        <AlertDialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (next) {
              setFormError(null)
            }
          }}
        >
          <AlertDialogTrigger render={<Button />}>Create category</AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader className="place-items-start text-left">
              <AlertDialogTitle>Create category</AlertDialogTitle>
              <AlertDialogDescription>Add a new category for products.</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <div className="text-sm font-medium text-muted-foreground">Name</div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vegetables"
                  disabled={submitting}
                />
              </div>

              <div className="grid gap-1.5">
                <div className="text-sm font-medium text-muted-foreground">Description</div>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                  disabled={submitting}
                />
              </div>

              {formError ? <div className="text-sm text-destructive">{formError}</div> : null}
            </div>

            <AlertDialogFooter className="sm:justify-end">
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                render={<Button />}
                disabled={submitting}
                onClick={(e) => {
                  e.preventDefault()
                  void handleCreate()
                }}
              >
                {submitting ? "Creating..." : "Create"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <AlertDialog
        open={editOpen}
        onOpenChange={(next) => {
          setEditOpen(next)
          if (!next) {
            setEditing(null)
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader className="place-items-start text-left">
            <AlertDialogTitle>Edit category</AlertDialogTitle>
            <AlertDialogDescription>Update name and description.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Vegetables"
                disabled={editSubmitting}
              />
            </div>

            <div className="grid gap-1.5">
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional"
                disabled={editSubmitting}
              />
            </div>

            {editError ? <div className="text-sm text-destructive">{editError}</div> : null}
          </div>

          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel disabled={editSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              render={<Button />}
              disabled={editSubmitting || !editing}
              onClick={(e) => {
                e.preventDefault()
                void handleEditSave()
              }}
            >
              {editSubmitting ? "Saving..." : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaginatedTable
        columns={columns}
        fetchPage={fetchPage}
        rowKey={(r) => r.id}
        refreshToken={refreshToken}
      />
    </div>
  )
}

