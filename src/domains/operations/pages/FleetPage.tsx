import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { useAppSelector } from "@/app/store/hooks"
import {
  selectCompanyId,
  selectLocationId,
} from "@/app/store/slices/contextSelectors"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { StatusBadge } from "@/shared/components/StatusBadge"
import { useFleet } from "@/shared/hooks/useFleet"
import { deviceList, locationList } from "@/shared/mock"
import { formatRelativeTime } from "@/shared/utils/date"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type FleetRow = {
  deviceId: string
  deviceName: string
  status: "online" | "offline" | "maintenance"
  locationName: string
  firmwareVersion: string
  lastSeen: string
  cycles7d: number
  needsMaintenance: boolean
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "maintenance", label: "Maintenance" },
] as const

type StatusFilter = (typeof statusOptions)[number]["value"]

export function FleetPage() {
  const navigate = useNavigate()
  const companyId = useAppSelector(selectCompanyId)
  const locationId = useAppSelector(selectLocationId)
  const { data, status, error, refetch } = useFleet()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  useEffect(() => {
    refetch()
  }, [companyId, locationId, refetch])

  const rows = useMemo<FleetRow[]>(() => {
    return data.map((device) => {
      const deviceInfo = deviceList.find((item) => item.id === device.deviceId)
      const location = locationList.find(
        (item) => item.id === deviceInfo?.locationId
      )

      return {
        deviceId: device.deviceId,
        deviceName: deviceInfo?.name ?? device.deviceId,
        status: device.status,
        locationName: location?.name ?? "Unknown",
        firmwareVersion: device.firmwareVersion,
        lastSeen: device.lastSeen,
        cycles7d: device.cycles7d,
        needsMaintenance: device.needsMaintenance,
      }
    })
  }, [data])

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return rows
    return rows.filter((row) => row.status === statusFilter)
  }, [rows, statusFilter])

  const columns = useMemo<ColumnDef<FleetRow>[]>(
    () => [
      {
        accessorKey: "deviceName",
        header: "Device",
        cell: ({ row }) => (
          <div className="font-medium text-foreground">{row.original.deviceName}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge label={row.original.status} variant={row.original.status} />
        ),
      },
      {
        accessorKey: "locationName",
        header: "Location",
      },
      {
        accessorKey: "firmwareVersion",
        header: "Firmware",
      },
      {
        accessorKey: "lastSeen",
        header: "Last Seen",
        cell: ({ row }) => formatRelativeTime(row.original.lastSeen),
      },
      {
        accessorKey: "cycles7d",
        header: "Cycles (7d)",
      },
      {
        accessorKey: "needsMaintenance",
        header: "Maintenance",
        cell: ({ row }) =>
          row.original.needsMaintenance ? (
            <StatusBadge label="Needs" variant="maintenance" />
          ) : (
            <StatusBadge label="Ok" variant="online" />
          ),
      },
    ],
    []
  )

  return (
    <PageLayout>
      <PageHeader
        title="Fleet"
        description="Live fleet health and utilization across locations."
      />
      <Section title="Device status" description="Track device health by site.">
        {filteredRows.length === 0 && status !== "loading" ? (
          <EmptyState
            title="No fleet items found"
            description="Try adjusting filters or select a different context."
          />
        ) : (
          <DataTable
            title="Fleet overview"
            description="Devices filtered by current context."
            actions={
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            columns={columns}
            data={filteredRows}
            isLoading={status === "loading"}
            errorMessage={error}
            emptyMessage="No devices match filters."
            enableSearch={true}
            searchPlaceholder="Quick search"
            stickyHeader={true}
            filterFn={(row, query) => {
              const haystack = `${row.deviceName} ${row.locationName} ${row.firmwareVersion}`.toLowerCase()
              return haystack.includes(query)
            }}
            rowActions={(row) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Row actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(`/eng/devices/${row.deviceId}`)}
                  >
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard?.writeText(row.deviceId)}
                  >
                    Copy ID
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            onRowClick={(row) => navigate(`/eng/devices/${row.deviceId}`)}
          />
        )}
      </Section>
    </PageLayout>
  )
}
