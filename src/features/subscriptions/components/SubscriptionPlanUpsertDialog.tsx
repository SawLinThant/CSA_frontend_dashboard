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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BoxListItem } from "@/features/boxes/api/boxesApi"
import { listBoxes } from "@/features/boxes/api/boxesApi"
import type { DeliveryFrequency, SubscriptionPlan } from "@/features/subscriptions/api/subscriptionPlansApi"
import { createSubscriptionPlan, updateSubscriptionPlan } from "@/features/subscriptions/api/subscriptionPlansApi"

type Mode = "create" | "edit"

export function SubscriptionPlanUpsertDialog(props: {
  mode: Mode
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: SubscriptionPlan | null
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [boxes, setBoxes] = useState<BoxListItem[]>([])

  const [boxId, setBoxId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("0")
  const [deliveryFrequency, setDeliveryFrequency] = useState<DeliveryFrequency>("weekly")
  const [deliveriesPerCycle, setDeliveriesPerCycle] = useState("4")
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (!props.open) return
    void listBoxes({ page: 1, limit: 100 })
      .then((res) => setBoxes(res.items))
      .catch(() => setBoxes([]))
  }, [props.open])

  useEffect(() => {
    if (!props.open) return
    const p = props.initial ?? null
    setBoxId(p?.boxId ?? "")
    setName(p?.name ?? "")
    setPrice(String(p?.price ?? 0))
    setDeliveryFrequency(p?.deliveryFrequency ?? "weekly")
    setDeliveriesPerCycle(String(p?.deliveriesPerCycle ?? 4))
    setActive(Boolean(p?.active ?? true))
  }, [props.open, props.initial])

  const selectedBoxName = useMemo(() => {
    if (!boxId) return ""
    return boxes.find((b) => b.id === boxId)?.name ?? ""
  }, [boxes, boxId])

  const canSubmit = useMemo(() => {
    const p = Number(price)
    const d = Number(deliveriesPerCycle)
    if (!name.trim()) return false
    if (!boxId) return false
    if (!Number.isFinite(p) || p <= 0) return false
    if (!Number.isFinite(d) || d <= 0 || !Number.isInteger(d)) return false
    return true
  }, [name, boxId, price, deliveriesPerCycle])

  async function onSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const p = Number(price)
      const d = Number(deliveriesPerCycle)

      if (props.mode === "create") {
        await createSubscriptionPlan({
          boxId,
          name: name.trim(),
          price: p,
          deliveryFrequency,
          deliveriesPerCycle: d,
          active,
        })
        toast.success("Plan created")
      } else {
        const id = props.initial?.id
        if (!id) throw new Error("Missing plan id")
        await updateSubscriptionPlan(id, {
          name: name.trim(),
          price: p,
          deliveryFrequency,
          deliveriesPerCycle: d,
          active,
        })
        toast.success("Plan updated")
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
          <DialogTitle>{props.mode === "create" ? "Create subscription plan" : "Edit subscription plan"}</DialogTitle>
          <DialogDescription>Define the plan pricing and delivery cadence.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Box</Label>
            <Select value={boxId} onValueChange={(v) => setBoxId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a box">{selectedBoxName}</SelectValue>
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

          <div className="grid gap-2">
            <Label htmlFor="plan-name">Name</Label>
            <Input id="plan-name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan-price">Price</Label>
            <Input
              id="plan-price"
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.currentTarget.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Delivery frequency</Label>
            <Select value={deliveryFrequency} onValueChange={(v) => setDeliveryFrequency((v ?? "weekly") as DeliveryFrequency)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deliveries">Deliveries per cycle</Label>
            <Input
              id="deliveries"
              type="number"
              min={1}
              step={1}
              value={deliveriesPerCycle}
              onChange={(e) => setDeliveriesPerCycle(e.currentTarget.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={active} onCheckedChange={(v) => setActive(Boolean(v))} />
            <Label>Active</Label>
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

