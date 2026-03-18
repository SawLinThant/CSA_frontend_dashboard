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
import type { BoxVersionListItem } from "@/features/boxVersions/api/boxVersionsApi"
import { listBoxVersions } from "@/features/boxVersions/api/boxVersionsApi"
import type { PublicProductListItem } from "@/features/products/api/listProducts"
import { listProductsAuthed } from "@/features/products/api/listProducts"
import type { FarmerListItem } from "@/features/farmers/api/listFarmers"
import { listFarmers } from "@/features/farmers/api/listFarmers"
import type { BoxItem } from "@/features/boxItems/api/boxItemsApi"
import { createBoxItem, updateBoxItem } from "@/features/boxItems/api/boxItemsApi"

type Mode = "create" | "edit"

export function BoxItemUpsertDialog(props: {
  mode: Mode
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: BoxItem | null
  presetBoxVersionId?: string
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  const [versions, setVersions] = useState<BoxVersionListItem[]>([])
  const [products, setProducts] = useState<PublicProductListItem[]>([])
  const [farmers, setFarmers] = useState<FarmerListItem[]>([])

  const [boxVersionId, setBoxVersionId] = useState("")
  const [productId, setProductId] = useState("")
  const [farmerId, setFarmerId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [optional, setOptional] = useState(false)

  useEffect(() => {
    if (!props.open) return
    void Promise.allSettled([
      listBoxVersions({ page: 1, limit: 100 }),
      listProductsAuthed({ page: 1, limit: 100 }),
      listFarmers({ page: 1, limit: 100 }),
    ]).then((results) => {
      const v = results[0].status === "fulfilled" ? results[0].value.items : []
      const p = results[1].status === "fulfilled" ? results[1].value.items : []
      const f = results[2].status === "fulfilled" ? results[2].value.items : []
      setVersions(v)
      setProducts(p)
      setFarmers(f)
    })
  }, [props.open])

  useEffect(() => {
    if (!props.open) return
    const initial = props.initial ?? null
    setBoxVersionId(initial?.boxVersionId ?? props.presetBoxVersionId ?? "")
    setProductId(initial?.productId ?? "")
    setFarmerId(initial?.farmerId ?? "")
    setQuantity(String(initial?.quantity ?? 1))
    setOptional(Boolean(initial?.optional ?? false))
  }, [props.open, props.initial, props.presetBoxVersionId])

  const canSubmit = useMemo(() => {
    const q = Number(quantity)
    if (!Number.isFinite(q) || q <= 0 || !Number.isInteger(q)) return false
    if (props.mode === "create") {
      return Boolean(boxVersionId && productId && farmerId)
    }
    return true
  }, [quantity, props.mode, boxVersionId, productId, farmerId])

  async function onSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const q = Number(quantity)
      if (props.mode === "create") {
        await createBoxItem({
          boxVersionId,
          productId,
          farmerId,
          quantity: q,
          optional,
        })
        toast.success("Box item created")
      } else {
        const id = props.initial?.id
        if (!id) throw new Error("Missing box item id")
        await updateBoxItem(id, { quantity: q, optional })
        toast.success("Box item updated")
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
          <DialogTitle>{props.mode === "create" ? "Create box item" : "Edit box item"}</DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Choose a version, product, and farmer."
              : "Update quantity/optional flags."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {props.mode === "create" && (
            <>
              <div className="grid gap-2">
                <Label>Box version</Label>
                <Select value={boxVersionId} onValueChange={(v) => setBoxVersionId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select version" />
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

              <div className="grid gap-2">
                <Label>Product</Label>
                <Select value={productId} onValueChange={(v) => setProductId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Farmer</Label>
                <Select value={farmerId} onValueChange={(v) => setFarmerId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.currentTarget.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={optional} onCheckedChange={(v) => setOptional(Boolean(v))} />
            <Label>Optional</Label>
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

