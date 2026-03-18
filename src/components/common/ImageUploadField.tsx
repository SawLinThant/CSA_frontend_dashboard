import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

const FALLBACK_SRC = "/images/box_placeholder.jpg"

export function ImageUploadField(props: {
  id: string
  label: string
  value: File | null
  onChange: (file: File | null) => void
  initialImageUrl?: string | null
  accept?: string
}) {
  const [inputKey, setInputKey] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const objectUrl = useMemo(() => {
    if (!props.value) return null
    return URL.createObjectURL(props.value)
  }, [props.value])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const previewSrc = objectUrl ?? props.initialImageUrl ?? FALLBACK_SRC

  useEffect(() => {
    setLoaded(false)
  }, [previewSrc])

  return (
    <div className="grid gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-28 overflow-hidden rounded-md border bg-muted">
          {!loaded && <Skeleton className="absolute inset-0 h-full w-full" />}
          <img
            src={previewSrc}
            alt="Preview"
            className="h-full w-full object-cover"
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = FALLBACK_SRC
              setLoaded(true)
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input
            key={inputKey}
            id={props.id}
            type="file"
            accept={props.accept ?? "image/*"}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0] ?? null
              props.onChange(file)
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => props.onChange(null)}
              disabled={!props.value}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                props.onChange(null)
                setInputKey((k) => k + 1)
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Supported: JPG/PNG/GIF/WEBP (max 5MB)
      </p>
    </div>
  )
}

