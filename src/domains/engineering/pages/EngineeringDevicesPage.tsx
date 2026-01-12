import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Cpu } from "lucide-react"

import { routePaths } from "@/app/router/routes"
import { useAppSelector } from "@/app/store/hooks"
import { selectHasCapability } from "@/app/store/slices/authSelectors"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { StatusBadge } from "@/shared/components/StatusBadge"
import alerts from "@/shared/mock/alerts.json"
import { companyList, deviceList, locationList } from "@/shared/mock"
import deviceStatus from "@/shared/mock/deviceStatus.json"
import type { Alert } from "@/shared/mock/domainTypes"
import { formatRelativeTime } from "@/shared/utils/date"
import { Button } from "@/shared/ui/button"

type DeviceRow = {
  id: string
  name: string
  locationName: string
  companyName: string
  status?: DeviceStatusEntry["status"]
  lastSeen?: string
  alertsCount: number
}

type DeviceStatusEntry = {
  deviceId: string
  status: "online" | "offline" | "maintenance"
  lastSeen: string
}

function getStatusVariant(status?: DeviceStatusEntry["status"]) {
  if (status === "maintenance") return "maintenance"
  if (status === "offline") return "critical"
  if (status === "online") return "online"
  return "info"
}

export function EngineeringDevicesPage() {
  const navigate = useNavigate()
  const canPushFirmware = useAppSelector(selectHasCapability("can_push_firmware"))
  const statusList = deviceStatus as DeviceStatusEntry[]
  const alertList = alerts as Alert[]
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const locationById = useMemo(
    () => new Map(locationList.map((location) => [location.id, location])),
    []
  )
  const companyById = useMemo(
    () => new Map(companyList.map((company) => [company.id, company])),
    []
  )
  const statusById = useMemo(() => {
    return new Map(statusList.map((entry) => [entry.deviceId, entry]))
  }, [statusList])

  const alertsByDeviceId = useMemo(() => {
    return alertList.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.deviceId] = (acc[alert.deviceId] ?? 0) + 1
      return acc
    }, {})
  }, [alertList])

  const rows = useMemo<DeviceRow[]>(() => {
    return deviceList.map((device) => {
      const location = locationById.get(device.locationId)
      const companyName = location
        ? companyById.get(location.companyId)?.name ?? "Unknown"
        : "Unknown"
      const statusEntry = statusById.get(device.id)
      return {
        id: device.id,
        name: device.name,
        locationName: location?.name ?? "Unknown",
        companyName,
        status: statusEntry?.status,
        lastSeen: statusEntry?.lastSeen,
        alertsCount: alertsByDeviceId[device.id] ?? 0,
      }
    })
  }, [alertsByDeviceId, companyById, locationById, statusById])

  const allSelected = rows.length > 0 && selectedIds.size === rows.length

  const columns = useMemo<ColumnDef<DeviceRow>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(event) => {
              if (event.target.checked) {
                setSelectedIds(new Set(rows.map((row) => row.id)))
              } else {
                setSelectedIds(new Set())
              }
            }}
            aria-label="Select all devices"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.has(row.original.id)}
            onChange={(event) => {
              const next = new Set(selectedIds)
              if (event.target.checked) {
                next.add(row.original.id)
              } else {
                next.delete(row.original.id)
              }
              setSelectedIds(next)
            }}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Device",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: "Device ID",
      },
      {
        accessorKey: "locationName",
        header: "Location",
      },
      {
        accessorKey: "companyName",
        header: "Company",
      },
      {
        accessorKey: "lastSeen",
        header: "Last seen",
        cell: ({ row }) =>
          row.original.lastSeen ? formatRelativeTime(row.original.lastSeen) : "Unknown",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.status ? (
            <StatusBadge
              label={row.original.status}
              variant={getStatusVariant(row.original.status)}
            />
          ) : (
            "Unknown"
          ),
      },
      {
        accessorKey: "alertsCount",
        header: "Alerts",
      },
    ],
    [allSelected, rows, selectedIds]
  )

  return (
    <PageLayout>
      <PageHeader
        title="Devices"
        description="Engineering visibility into devices and diagnostics."
      />
      <Section title="Devices directory" description="All devices in the demo dataset.">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select devices"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={selectedIds.size === 0}
              onClick={() => undefined}
            >
              Run diagnostics
            </Button>
            <Button
              disabled={selectedIds.size === 0 || !canPushFirmware}
              onClick={() => undefined}
            >
              Promote firmware
            </Button>
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            title="No devices available"
            description="Add devices to view diagnostics."
          />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            enableSearch={true}
            searchPlaceholder="Search devices"
            stickyHeader={true}
            filterFn={(row, query) => {
              const haystack = `${row.name} ${row.id} ${row.locationName} ${row.companyName} ${row.status ?? ""}`.toLowerCase()
              return haystack.includes(query)
            }}
            onRowClick={(row) =>
              navigate(routePaths.engineering.deviceDetail(row.id))
            }
          />
        )}
      </Section>
    </PageLayout>
  )
}
