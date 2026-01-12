import { useEffect, useMemo } from "react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { FileDown, Leaf, RefreshCcw, Recycle, Wrench } from "lucide-react"

import { useAppSelector } from "@/app/store/hooks"
import {
  selectCompanyId,
  selectDateRange,
} from "@/app/store/slices/contextSelectors"
import { ChartCardShell } from "@/shared/components/ChartCardShell"
import { EmptyState } from "@/shared/components/EmptyState"
import { ErrorState } from "@/shared/components/ErrorState"
import { KpiCard } from "@/shared/components/KpiCard"
import { LoadingState } from "@/shared/components/LoadingState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { StatPill } from "@/shared/components/StatPill"
import { useBusinessOverview } from "@/shared/hooks/useBusinessOverview"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

const datePresets = [
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "ytd", label: "YTD" },
] as const

type DateRangeKey = (typeof datePresets)[number]["key"]

type TrendPoint = {
  label: string
  cycles: number
}

function getDateRangeKey(dateRange: { start: string | null; end: string | null }) {
  const today = new Date()
  const toISO = (value: Date) => value.toISOString().slice(0, 10)
  const map: Record<DateRangeKey, { start: string; end: string }> = {
    last7: {
      start: toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)),
      end: toISO(today),
    },
    last30: {
      start: toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)),
      end: toISO(today),
    },
    ytd: {
      start: toISO(new Date(today.getFullYear(), 0, 1)),
      end: toISO(today),
    },
  }

  const match = (Object.keys(map) as DateRangeKey[]).find((key) => {
    const preset = map[key]
    return preset.start === dateRange.start && preset.end === dateRange.end
  })

  return match ?? "last7"
}

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm">
      <div className="font-medium text-foreground">{label}</div>
      <div className="mt-1 text-muted-foreground">Cycles: {payload[0]?.value}</div>
    </div>
  )
}

export function OverviewPage() {
  const companyId = useAppSelector(selectCompanyId)
  const dateRange = useAppSelector(selectDateRange)
  const { data, status, error, refetch } = useBusinessOverview()

  useEffect(() => {
    refetch()
  }, [companyId, dateRange.end, dateRange.start, refetch])

  const trendData = useMemo<TrendPoint[]>(() => {
    if (!data) return []
    const points = 7
    const base = Math.max(1, Math.round(data.cyclesCompleted / points))
    return Array.from({ length: points }, (_, index) => {
      const variance = index % 2 === 0 ? 3 : -2
      return {
        label: `D${index + 1}`,
        cycles: Math.max(0, base + variance + index),
      }
    })
  }, [data])

  const dateRangeKey = getDateRangeKey(dateRange)
  const dateRangeLabel = datePresets.find((preset) => preset.key === dateRangeKey)?.label ?? "Last 7 days"

  return (
    <PageLayout>
      <PageHeader
        title="Business Overview"
        description="Summary metrics and activity across your fleet."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export CSV (demo)</DropdownMenuItem>
              <DropdownMenuItem>Export PDF (demo)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <Section
        title="KPIs"
        description="Snapshot of emissions and throughput for the selected company."
        actions={<StatPill label="Date range" value={dateRangeLabel} />}
      >
        {status === "loading" ? (
          <LoadingState message="Loading KPIs..." />
        ) : error ? (
          <ErrorState title="Unable to load KPIs" description={error} />
        ) : !data ? (
          <EmptyState title="Select a company to view KPIs." description="Choose a company in the top bar to reveal summary metrics." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="CO2 avoided"
              value={`${data.co2AvoidedKg.toLocaleString()} kg`}
              helper="Estimated emissions avoided"
              icon={Leaf}
            />
            <KpiCard
              label="Waste diverted"
              value={`${data.wasteDivertedKg.toLocaleString()} kg`}
              helper="Total diverted from landfill"
              icon={Recycle}
            />
            <KpiCard
              label="Cycles completed"
              value={data.cyclesCompleted.toLocaleString()}
              helper="Total processing cycles"
              icon={RefreshCcw}
            />
            <KpiCard
              label="Maintenance required"
              value={data.maintenanceRequiredCount.toString()}
              helper="Active maintenance flags"
              icon={Wrench}
            />
          </div>
        )}
      </Section>
      <Section
        title="Trend"
        description="Recent throughput trend for the selected date range."
      >
        <ChartCardShell
          title="Cycle throughput"
          metric={data ? `${data.cyclesCompleted} cycles` : "No data"}
        >
          {status === "loading" ? (
            <LoadingState message="Loading chart..." />
          ) : error ? (
            <ErrorState title="Unable to load trend" description={error} />
          ) : !data ? (
            <EmptyState title="Select a company to view trends." description="Trends will appear once a company is selected." />
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cycles
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ left: 12, right: 12 }}>
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<TrendTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="cycles"
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </ChartCardShell>
      </Section>
    </PageLayout>
  )
}
