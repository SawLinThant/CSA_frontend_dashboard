"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { authedGetJson } from "@/services/http/authedFetch"

type AnalyticsSummary = {
  totalRevenue: number
  newCustomers: number
  activeAccounts: number
  growthRate: number
}

export function SectionCards() {
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await authedGetJson<AnalyticsSummary>(
          "/auth/admin/analytics/summary",
        )
        if (!cancelled) setSummary(data)
      } catch {
        // Keep UI stable even if analytics fails to load.
        if (!cancelled) setSummary(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const currencyFmt = React.useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    [],
  )
  const numberFmt = React.useMemo(() => new Intl.NumberFormat("en-US"), [])

  const hasSummary = summary !== null
  const growthRate = hasSummary ? summary.growthRate : 0
  const growthIsPositive = hasSummary ? growthRate >= 0 : true
  const growthRounded = hasSummary ? Number(growthRate.toFixed(1)) : 0
  const growthText = `${growthIsPositive ? "+" : ""}${growthRounded}%`

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "—" : hasSummary ? currencyFmt.format(summary.totalRevenue) : "—"}
          </CardTitle>
          <CardAction>
            {loading ? (
              <Badge variant="outline">Loading</Badge>
            ) : (
              hasSummary ? (
                <Badge variant="outline">
                  {growthIsPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  {growthText}
                </Badge>
              ) : (
                <Badge variant="outline">N/A</Badge>
              )
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Growth vs previous 30 days{" "}
            {hasSummary && (growthIsPositive ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />)}
          </div>
          <div className="text-muted-foreground">
            Revenue (successful payments)
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "—" : hasSummary ? numberFmt.format(summary.newCustomers) : "—"}
          </CardTitle>
          <CardAction>
            {loading ? (
              <Badge variant="outline">Loading</Badge>
            ) : hasSummary ? (
              <Badge variant="outline">Last 30 days</Badge>
            ) : (
              <Badge variant="outline">N/A</Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Customer acquisition in the last 30 days{" "}
            {hasSummary ? <TrendingUpIcon className="size-4" /> : null}
          </div>
          <div className="text-muted-foreground">
            Customers registered as role `customer`
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "—" : hasSummary ? numberFmt.format(summary.activeAccounts) : "—"}
          </CardTitle>
          <CardAction>
            {loading ? (
              <Badge variant="outline">Loading</Badge>
            ) : hasSummary ? (
              <Badge variant="outline">Currently active</Badge>
            ) : (
              <Badge variant="outline">N/A</Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Users with status `active`{" "}
            {hasSummary ? <TrendingUpIcon className="size-4" /> : null}
          </div>
          <div className="text-muted-foreground">Account availability</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "—" : hasSummary ? `${growthRounded}%` : "—"}
          </CardTitle>
          <CardAction>
            {loading ? (
              <Badge variant="outline">Loading</Badge>
            ) : (
              hasSummary ? (
                <Badge variant="outline">
                  {growthIsPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  {growthText}
                </Badge>
              ) : (
                <Badge variant="outline">N/A</Badge>
              )
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Revenue growth vs previous 30 days{" "}
            {hasSummary && (growthIsPositive ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />)}
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}
