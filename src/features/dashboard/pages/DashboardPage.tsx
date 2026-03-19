import { SectionCards } from "@/components/section-cards"
import { useEffect, useMemo, useState } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import { listCustomers } from "@/features/customers/api/listCustomers"
import { listFarmers } from "@/features/farmers/api/listFarmers"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [customerRows, setCustomerRows] = useState<Array<{ dayLabel: string; count: number }>>([])
  const [farmerRows, setFarmerRows] = useState<Array<{ dayLabel: string; count: number }>>([])
  const [error, setError] = useState<string | null>(null)

  const days = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 6) // inclusive: today + previous 6 days

    const result: Array<{ key: string; label: string; ms: number }> = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = toLocalDayKey(d)
      const label = d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      result.push({ key, label, ms: d.getTime() })
    }
    return result
  }, [])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const earliestMs = days[0]?.ms ?? 0

        const [customers, farmers] = await Promise.all([
          fetchCreatedItemsUntilOlder(listCustomers, earliestMs),
          fetchCreatedItemsUntilOlder(listFarmers, earliestMs),
        ])

        if (cancelled) return

        const customerMap = countByLocalDay(customers, earliestMs, days.map((d) => d.key))
        const farmerMap = countByLocalDay(farmers, earliestMs, days.map((d) => d.key))

        setCustomerRows(
          days.map((d) => ({
            dayLabel: d.label,
            count: customerMap.get(d.key) ?? 0,
          })),
        )
        setFarmerRows(
          days.map((d) => ({
            dayLabel: d.label,
            count: farmerMap.get(d.key) ?? 0,
          })),
        )
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [days])

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4">
      <SectionCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 p-6">
        <RegistrationsTable
          title="Customers registered (last 7 days)"
          loading={loading}
          rows={customerRows}
          error={error}
        />
        <RegistrationsTable
          title="Farmers registered (last 7 days)"
          loading={loading}
          rows={farmerRows}
          error={error}
        />
      </div>
    </div>
  )
}

function toLocalDayKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

async function fetchCreatedItemsUntilOlder<
  T extends { createdAt: string },
>(fetchPageFn: (params: { page: number; limit: number }) => Promise<{ items: T[]; total: number }>, earliestMs: number): Promise<T[]> {
  const limit = 100 // matches backend max per request
  let page = 1
  const all: T[] = []

  while (true) {
    const res = await fetchPageFn({ page, limit })
    all.push(...res.items)

    if (res.items.length === 0) break

    const lastItem = res.items[res.items.length - 1]
    const lastCreatedAtMs = new Date(lastItem.createdAt).getTime()

    // backend sorts by createdAt DESC, so once we cross the earliest window we can stop
    if (lastCreatedAtMs < earliestMs) break
    if (page * limit >= res.total) break

    page += 1
  }

  return all
}

function countByLocalDay<T extends { createdAt: string }>(
  items: T[],
  earliestMs: number,
  keysInRange: string[],
): Map<string, number> {
  const map = new Map<string, number>()
  for (const k of keysInRange) map.set(k, 0)

  for (const item of items) {
    const ms = new Date(item.createdAt).getTime()
    if (ms < earliestMs) continue
    const key = toLocalDayKey(new Date(item.createdAt))
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
  }

  return map
}

function RegistrationsTable({
  title,
  loading,
  rows,
  error,
}: {
  title: string
  loading: boolean
  rows: Array<{ dayLabel: string; count: number }>
  error: string | null
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-muted-foreground">{title}</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[55%]">Day</TableHead>
            <TableHead className="w-[45%] text-right">Registered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 7 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Skeleton className="h-4 w-[60%]" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-[40%]" />
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                {error}
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((r, idx) => (
              <TableRow key={`${r.dayLabel}-${idx}`}>
                <TableCell className="text-muted-foreground">{r.dayLabel}</TableCell>
                <TableCell className="text-right font-medium">{r.count}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

