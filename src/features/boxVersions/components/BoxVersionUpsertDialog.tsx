import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BoxListItem } from "@/features/boxes/api/boxesApi"
import { listBoxes } from "@/features/boxes/api/boxesApi"
import type { BoxVersionListItem } from "@/features/boxVersions/api/boxVersionsApi"
import { createBoxVersion, updateBoxVersion } from "@/features/boxVersions/api/boxVersionsApi"

type Mode = "create" | "edit"

function toDateInputValue(value?: string | null) {
  if (!value) return ""
  // Supports ISO strings from backend.
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function BoxVersionUpsertDialog(props: {
  mode: Mode
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: BoxVersionListItem | null
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [boxes, setBoxes] = useState<BoxListItem[]>([])

  const [boxId, setBoxId] = useState("")
  const [versionName, setVersionName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const selectedBoxName = useMemo(() => {
    if (!boxId) return ""
    return boxes.find((b) => b.id === boxId)?.name ?? ""
  }, [boxes, boxId])

  useEffect(() => {
    if (!props.open) return
    void listBoxes({ page: 1, limit: 100 })
      .then((res) => setBoxes(res.items))
      .catch(() => setBoxes([]))
  }, [props.open])

  useEffect(() => {
    if (!props.open) return
    const v = props.initial ?? null
    setBoxId(v?.boxId ?? "")
    setVersionName(v?.versionName ?? "")
    setStartDate(toDateInputValue(v?.startDate))
    setEndDate(toDateInputValue(v?.endDate ?? null))
  }, [props.open, props.initial])

  const canSubmit = useMemo(() => {
    if (!versionName.trim()) return false
    if (!startDate) return false
    if (props.mode === "create" && !boxId) return false
    return true
  }, [versionName, startDate, props.mode, boxId])

  async function onSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      if (props.mode === "create") {
        await createBoxVersion({
          boxId,
          versionName: versionName.trim(),
          startDate,
          endDate: endDate ? endDate : null,
        })
        toast.success("Box version created")
      } else {
        const id = props.initial?.id
        if (!id) throw new Error("Missing box version id")
        await updateBoxVersion(id, {
          versionName: versionName.trim(),
          startDate,
          endDate: endDate ? endDate : null,
        })
        toast.success("Box version updated")
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
          <DialogTitle>{props.mode === "create" ? "Create box version" : "Edit box version"}</DialogTitle>
          <DialogDescription>
            {props.mode === "create" ? "Select a box and define a version period." : "Update version details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {props.mode === "create" && (
            <div className="grid gap-2">
              <Label>Box</Label>
              <Select value={boxId} onValueChange={(v) => setBoxId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a box">
                    {selectedBoxName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {boxes.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="version-name">Version name</Label>
            <Input
              id="version-name"
              value={versionName}
              onChange={(e) => setVersionName(e.currentTarget.value)}
              placeholder="Week 1"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="start-date">Start date</Label>
            <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="end-date">End date (optional)</Label>
            <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={submitting}>
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

