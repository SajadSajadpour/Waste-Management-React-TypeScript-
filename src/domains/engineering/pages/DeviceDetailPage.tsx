import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Activity, Cpu, ShieldAlert } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectHasCapability } from "@/app/store/slices/authSelectors"
import { setDeviceId } from "@/app/store/slices/contextSlice"
import { ContentCard } from "@/shared/components/ContentCard"
import { DataTable } from "@/shared/components/DataTable"
import { ErrorState } from "@/shared/components/ErrorState"
import { EmptyState } from "@/shared/components/EmptyState"
import { LoadingState } from "@/shared/components/LoadingState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { StatusBadge } from "@/shared/components/StatusBadge"
import { useDeviceDiagnostics } from "@/shared/hooks/useDeviceDiagnostics"
import { useFirmware } from "@/shared/hooks/useFirmware"
import { deviceList } from "@/shared/mock"
import type {
  DeviceLog,
  DeviceTelemetry,
  FirmwareRelease,
} from "@/shared/mock/domainTypes"
import { formatISODate, formatRelativeTime } from "@/shared/utils/date"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

const logLevels = [
  { value: "all", label: "All levels" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warn" },
  { value: "error", label: "Error" },
] as const

type LogLevel = (typeof logLevels)[number]["value"]

type TelemetryPoint = DeviceTelemetry["entries"][number] & { label: string }

function TelemetryTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { value?: number; name?: string }[]
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm">
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-2">
          <span className="capitalize text-muted-foreground">{item.name}</span>
          <span className="text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export function DeviceDetailPage() {
  const { deviceId } = useParams()
  const dispatch = useAppDispatch()
  const canViewEng = useAppSelector(selectHasCapability("can_view_eng"))
  const canSendCommands = useAppSelector(
    selectHasCapability("can_send_remote_commands")
  )
  const canPushFirmware = useAppSelector(
    selectHasCapability("can_push_firmware")
  )
  const { data, status, error, refetch } = useDeviceDiagnostics()
  const {
    data: firmware,
    status: firmwareStatus,
    error: firmwareError,
    refetch: refetchFirmware,
  } = useFirmware()

  const [logLevel, setLogLevel] = useState<LogLevel>("all")
  const [logQuery, setLogQuery] = useState("")

  const deviceInfo = useMemo(() => {
    if (!deviceId) return undefined
    const byId = deviceList.find((device) => device.id === deviceId)
    if (byId) return byId
    const target = deviceId.toLowerCase()
    return deviceList.find((device) => device.name.toLowerCase() === target)
  }, [deviceId])

  const resolvedDeviceId = deviceInfo?.id ?? deviceId ?? null

  useEffect(() => {
    dispatch(setDeviceId(resolvedDeviceId))
  }, [dispatch, resolvedDeviceId])

  useEffect(() => {
    refetch()
  }, [refetch, resolvedDeviceId])

  useEffect(() => {
    refetchFirmware()
  }, [refetchFirmware])

  const telemetryChartData = useMemo<TelemetryPoint[]>(() => {
    const entries = data?.telemetry?.entries ?? []
    return entries.map((entry, index) => ({
      ...entry,
      label: `T${index + 1}`,
    }))
  }, [data])

  const telemetryColumns = useMemo<ColumnDef<DeviceTelemetry["entries"][number]>[]>(
    () => [
      {
        accessorKey: "ts",
        header: "Timestamp",
        cell: ({ row }) => formatISODate(row.original.ts),
      },
      {
        accessorKey: "tempC",
        header: "Temp (C)",
      },
      {
        accessorKey: "motorLoadPct",
        header: "Motor Load",
        cell: ({ row }) => `${row.original.motorLoadPct}%`,
      },
      {
        accessorKey: "cyclePhase",
        header: "Phase",
      },
      {
        accessorKey: "doorOpen",
        header: "Door",
        cell: ({ row }) => (row.original.doorOpen ? "Open" : "Closed"),
      },
    ],
    []
  )

  const logColumns = useMemo<ColumnDef<DeviceLog["entries"][number]>[]>(
    () => [
      {
        accessorKey: "ts",
        header: "Timestamp",
        cell: ({ row }) => formatISODate(row.original.ts),
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => {
          const level = row.original.level
          const variant =
            level === "error" ? "critical" : level === "warn" ? "warn" : "info"
          return <StatusBadge label={level} variant={variant} />
        },
      },
      {
        accessorKey: "message",
        header: "Message",
      },
    ],
    []
  )

  const filteredLogs = useMemo(() => {
    const entries = data?.logs?.entries ?? []
    return entries.filter((entry) => {
      if (logLevel !== "all" && entry.level !== logLevel) return false
      if (logQuery.trim().length > 0) {
        return entry.message.toLowerCase().includes(logQuery.toLowerCase())
      }
      return true
    })
  }, [data, logLevel, logQuery])

  const firmwareColumns = useMemo<ColumnDef<FirmwareRelease>[]>(
    () => [
      {
        accessorKey: "version",
        header: "Version",
      },
      {
        accessorKey: "releasedAt",
        header: "Released",
        cell: ({ row }) => formatISODate(row.original.releasedAt),
      },
      {
        accessorKey: "rollout",
        header: "Rollout",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.status}
            variant={row.original.status === "available" ? "online" : "maintenance"}
          />
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
    ],
    []
  )

  if (!canViewEng) {
    return (
      <PageLayout>
        <PageHeader
          title="Engineering"
          description="Access to engineering diagnostics is limited for your role."
        />
        <EmptyState
          title="Engineering access required"
          description="Switch to an engineer persona to view device diagnostics."
        />
      </PageLayout>
    )
  }

  if (!deviceId) {
    return (
      <PageLayout>
        <PageHeader title="Device Detail" description="Select a device to view diagnostics." />
        <EmptyState title="No device selected" description="Open a device from the fleet list." />
      </PageLayout>
    )
  }

  if (status === "loading" && !data) {
    return (
      <PageLayout>
        <PageHeader title="Device Detail" description="Loading device diagnostics." />
        <LoadingState message="Loading diagnostics..." />
      </PageLayout>
    )
  }

  if (status === "failed" && error && !data) {
    return (
      <PageLayout>
        <PageHeader title="Device Detail" description="Unable to load device diagnostics." />
        <ErrorState title="Failed to load device" description={error} />
      </PageLayout>
    )
  }

  // refinement: don't show "not found" while loading
  if (!deviceInfo && status !== "loading") {
    return (
      <PageLayout>
        <PageHeader title="Device Detail" description="Device not found in the demo dataset." />
        <EmptyState
          title="Device not found"
          description="Select a different device to view diagnostics."
        />
      </PageLayout>
    )
  }

  const statusInfo = data?.status

  return (
    <PageLayout>
      <PageHeader
        title={deviceInfo?.name ?? "Device Detail"}
        description={deviceId ?? "Select a device to view diagnostics."}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={!canSendCommands}>
              Remote reboot
            </Button>
            <Button disabled={!canSendCommands}>Start diagnostic</Button>
          </div>
        }
      />
      <Section title="Device health" description="Live device diagnostics and metadata.">
        {statusInfo ? (
          <ContentCard>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <StatusBadge label={statusInfo.status} variant={statusInfo.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cpu className="h-4 w-4" />
                <span className="text-foreground">{statusInfo.firmwareVersion}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Last seen
                <div className="text-foreground">{formatRelativeTime(statusInfo.lastSeen)}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                Cycles (7d)
                <div className="text-foreground">{statusInfo.cycles7d}</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4" />
                <span className="text-foreground">
                  {statusInfo.needsMaintenance ? "Maintenance" : "Clear"}
                </span>
              </div>
            </div>
          </ContentCard>
        ) : null}
      </Section>

      <Section title="Device insights" description="Telemetry, logs, and firmware history.">
        <Tabs defaultValue="telemetry">
          <TabsList>
            <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="firmware">Firmware</TabsTrigger>
          </TabsList>

          <TabsContent value="telemetry">
            <div className="space-y-4">
              <ContentCard>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryChartData} margin={{ left: 12, right: 12 }}>
                      <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip content={<TelemetryTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="tempC"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={2}
                        dot={false}
                        name="Temp (C)"
                      />
                      <Line
                        type="monotone"
                        dataKey="motorLoadPct"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        dot={false}
                        name="Motor Load (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ContentCard>

              <DataTable
                columns={telemetryColumns}
                data={data?.telemetry?.entries ?? []}
                isLoading={status === "loading"}
                errorMessage={error}
                emptyMessage="No telemetry available."
                stickyHeader={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <DataTable
              columns={logColumns}
              data={filteredLogs}
              isLoading={status === "loading"}
              errorMessage={error}
              emptyMessage="No log entries available."
              stickyHeader={true}
              actions={
                <div className="flex items-center gap-2">
                  <Select value={logLevel} onValueChange={(value) => setLogLevel(value as LogLevel)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {logLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={logQuery}
                    onChange={(event) => setLogQuery(event.target.value)}
                    placeholder="Search logs"
                    className="w-[200px]"
                    aria-label="Search logs"
                  />
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="firmware">
            <DataTable
              columns={firmwareColumns}
              data={firmware}
              isLoading={firmwareStatus === "loading"}
              errorMessage={firmwareError}
              emptyMessage="No firmware releases available."
              stickyHeader={true}
              rowActions={
                canPushFirmware
                  ? () => (
                      <Button variant="outline" size="sm">
                        Promote
                      </Button>
                    )
                  : undefined
              }
            />
          </TabsContent>
        </Tabs>
      </Section>
    </PageLayout>
  )
}
