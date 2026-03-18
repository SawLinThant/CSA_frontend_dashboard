import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImageUploadField } from "@/components/common/ImageUploadField"
import type { BoxListItem } from "@/features/boxes/api/boxesApi"
import { createBoxWithUpload, updateBoxWithUpload } from "@/features/boxes/api/boxesApi"

type Mode = "create" | "edit"

export function BoxUpsertDialog(props: {
  mode: Mode
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: BoxListItem | null
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState<string>("")
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState<File | null>(null)

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false
    if (props.mode === "create") return image instanceof File
    return true
  }, [name, props.mode, image])

  useEffect(() => {
    if (!props.open) return
    const initial = props.initial ?? null
    setName(initial?.name ?? "")
    setDescription(initial?.description ?? "")
    setIsActive(initial?.isActive ?? true)
    setImage(null)
  }, [props.open, props.initial])

  async function onSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      if (props.mode === "create") {
        await createBoxWithUpload({
          name: name.trim(),
          description: description.trim() ? description.trim() : null,
          isActive,
          image: image as File,
        })
        toast.success("Box created")
      } else {
        const id = props.initial?.id
        if (!id) throw new Error("Missing box id")
        await updateBoxWithUpload(id, {
          name: name.trim(),
          description: description.trim() ? description.trim() : null,
          isActive,
          image,
        })
        toast.success("Box updated")
      }

      props.onOpenChange(false)
      props.onSuccess()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Create box" : "Edit box"}</DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Upload an image and enter box details."
              : "Update box details (optional image upload)."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="box-name">Name</Label>
            <Input
              id="box-name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Weekly Veggie Box"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="box-description">Description</Label>
            <Input
              id="box-description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              placeholder="Fresh vegetables every week"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isActive}
              onCheckedChange={(v) => setIsActive(Boolean(v))}
            />
            <Label>Active</Label>
          </div>

          <ImageUploadField
            id="box-image"
            label="Image"
            value={image}
            onChange={setImage}
            initialImageUrl={props.initial?.imageUrl ?? null}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={!canSubmit || submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

