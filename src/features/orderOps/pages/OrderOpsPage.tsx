import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import {
  getSubscriptionOrderOpsSummary,
  listSubscriptionOrderCycleEvents,
  type CycleEventOutcome,
  type SubscriptionOrderCycleEvent,
  type SubscriptionOrderOpsSummary,
} from "@/features/orderOps/api/orderOpsApi"

const AUTO_REFRESH_MS = 30_000

function toYmdLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function addDaysLocal(d: Date, delta: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + delta)
  return next
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString()
}

function outcomeBadge(outcome: CycleEventOutcome) {
  if (outcome === "created") return <Badge variant="default">created</Badge>
  if (outcome === "failed") return <Badge variant="destructive">failed</Badge>
  return <Badge variant="secondary">skipped</Badge>
}

export default function OrderOpsPage() {
  const [summary, setSummary] = useState<SubscriptionOrderOpsSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | CycleEventOutcome>("all")
  const [reasonFilter, setReasonFilter] = useState("")
  const [subscriptionIdFilter, setSubscriptionIdFilter] = useState("")

  const [autoRefresh, setAutoRefresh] = useState(false)

  const applyPreset = useCallback((preset: "today" | "7d" | "30d") => {
    const today = new Date()
    if (preset === "today") {
      const y = toYmdLocal(today)
      setFromDate(y)
      setToDate(y)
      return
    }
    const daysBack = preset === "7d" ? 6 : 29
    const start = addDaysLocal(today, -daysBack)
    setFromDate(toYmdLocal(start))
    setToDate(toYmdLocal(today))
  }, [])

  const applyReasonFromSummary = useCallback((reason: string) => {
    setReasonFilter(reason)
    setOutcomeFilter("failed")
    setRefreshToken((v) => v + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingSummary(true)
    setSummaryError(null)

    void getSubscriptionOrderOpsSummary({
      ...(fromDate ? { from: new Date(`${fromDate}T00:00:00.000Z`).toISOString() } : {}),
      ...(toDate ? { to: new Date(`${toDate}T23:59:59.999Z`).toISOString() } : {}),
    })
      .then((result) => {
        if (cancelled) return
        setSummary(result)
      })
      .catch((e) => {
        if (cancelled) return
        const message = e instanceof Error ? e.message : "Failed to load order ops summary"
        setSummaryError(message)
        toast.error(message)
      })
      .finally(() => {
        if (cancelled) return
        setLoadingSummary(false)
      })

    return () => {
      cancelled = true
    }
  }, [fromDate, toDate, refreshToken])

  useEffect(() => {
    if (!autoRefresh) return
    const id = window.setInterval(() => {
      setRefreshToken((v) => v + 1)
    }, AUTO_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [autoRefresh])

  const fetchEvents = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listSubscriptionOrderCycleEvents({
      page,
      limit,
      ...(outcomeFilter !== "all" ? { outcome: outcomeFilter } : {}),
      ...(reasonFilter.trim() ? { reason: reasonFilter.trim() } : {}),
      ...(subscriptionIdFilter.trim() ? { subscriptionId: subscriptionIdFilter.trim() } : {}),
      ...(fromDate ? { from: new Date(`${fromDate}T00:00:00.000Z`).toISOString() } : {}),
      ...(toDate ? { to: new Date(`${toDate}T23:59:59.999Z`).toISOString() } : {}),
    })
  }, [outcomeFilter, reasonFilter, subscriptionIdFilter, fromDate, toDate])

  const columns: ColumnDef<SubscriptionOrderCycleEvent>[] = useMemo(
    () => [
      { key: "createdAt", header: "Logged At", cell: (r) => formatDateTime(r.createdAt), className: "text-xs text-muted-foreground" },
      { key: "outcome", header: "Outcome", cell: (r) => outcomeBadge(r.outcome), className: "text-xs" },
      {
        key: "reason",
        header: "Reason",
        cell: (r) => {
          const text = r.reason ?? "-"
          if (!r.reason) return text
          return (
            <button
              type="button"
              className="max-w-[220px] truncate text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => {
                setReasonFilter(r.reason ?? "")
                setOutcomeFilter(r.outcome)
                setRefreshToken((v) => v + 1)
              }}
            >
              {text}
            </button>
          )
        },
        className: "text-xs text-muted-foreground",
      },
      { key: "subscription", header: "Subscription", cell: (r) => r.subscriptionId ?? "-", className: "text-xs text-muted-foreground" },
      { key: "cycleDate", header: "Cycle Date", cell: (r) => formatDateTime(r.cycleDate), className: "text-xs text-muted-foreground" },
      { key: "attempt", header: "Attempt", cell: (r) => r.attempt, className: "text-xs text-muted-foreground" },
    ],
    [],
  )

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-muted-foreground">Subscription Order Ops</h1>
          <p className="text-sm text-muted-foreground">
            Track due subscriptions, generated orders, failures, and cycle decision logs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="order-ops-auto-refresh"
              checked={autoRefresh}
              onCheckedChange={(v) => setAutoRefresh(v === true)}
            />
            <Label htmlFor="order-ops-auto-refresh" className="cursor-pointer text-sm text-muted-foreground">
              Auto-refresh every {AUTO_REFRESH_MS / 1000}s
            </Label>
          </div>
          <Button variant="outline" onClick={() => setRefreshToken((v) => v + 1)}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Due Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{loadingSummary ? "..." : (summary?.dueSubscriptions ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Generated Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{loadingSummary ? "..." : (summary?.generatedOrders ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Failed Attempts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{loadingSummary ? "..." : (summary?.failedAttempts.total ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Paused Capacity Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{loadingSummary ? "..." : (summary?.pausedCapacitySubscriptions ?? 0)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Failed Reasons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {summaryError ? (
            <div className="text-sm text-muted-foreground">{summaryError}</div>
          ) : (summary?.failedAttempts.byReason.length ?? 0) === 0 ? (
            <div className="text-sm text-muted-foreground">No failed attempts in selected range.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {summary?.failedAttempts.byReason.map((reason) => (
                <button
                  key={`${reason.reason}-${reason.count}`}
                  type="button"
                  onClick={() => applyReasonFromSummary(reason.reason)}
                  className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-4xl"
                >
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    {reason.reason}: {reason.count}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Event Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Quick range:</span>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("today")}>
              Today
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("7d")}>
              Last 7 days
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("30d")}>
              Last 30 days
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v as "all" | CycleEventOutcome)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outcomes</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter reason"
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
            />
            <Input
              placeholder="Subscription ID"
              value={subscriptionIdFilter}
              onChange={(e) => setSubscriptionIdFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <PaginatedTable
        columns={columns}
        fetchPage={fetchEvents}
        rowKey={(r) => r.id}
        refreshToken={refreshToken}
      />
    </div>
  )
}
