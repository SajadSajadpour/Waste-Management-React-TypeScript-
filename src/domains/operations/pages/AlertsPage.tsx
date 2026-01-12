import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import {
  selectCompanyId,
  selectDeviceId,
  selectLocationId,
} from "@/app/store/slices/contextSelectors"
import { updateAlertState } from "@/app/store/slices/operationsSlice"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { StatusBadge } from "@/shared/components/StatusBadge"
import { useAlerts } from "@/shared/hooks/useAlerts"
import { companyList, deviceList, locationList } from "@/shared/mock"
import type { Alert } from "@/shared/mock/domainTypes"
import type { Company, Device, Location } from "@/shared/mock/types"
import { formatISODate, formatRelativeTime } from "@/shared/utils/date"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type AlertRow = Alert & {
  deviceName: string
  locationName: string
  companyName: string
}

const severityOptions = [
  { value: "all", label: "All severities" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warn" },
  { value: "critical", label: "Critical" },
] as const

type SeverityFilter = (typeof severityOptions)[number]["value"]

const stateOptions = [
  { value: "all", label: "All states" },
  { value: "open", label: "Open" },
  { value: "ack", label: "Ack" },
  { value: "resolved", label: "Resolved" },
] as const

type StateFilter = (typeof stateOptions)[number]["value"]

function getSeverityVariant(severity: Alert["severity"]) {
  if (severity === "critical") return "critical"
  if (severity === "warn") return "warn"
  return "info"
}

export function AlertsPage() {
  const dispatch = useAppDispatch()
  const companyId = useAppSelector(selectCompanyId)
  const locationId = useAppSelector(selectLocationId)
  const deviceId = useAppSelector(selectDeviceId)
  const { data, status, error, refetch } = useAlerts()
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")
  const [stateFilter, setStateFilter] = useState<StateFilter>("all")
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)

  useEffect(() => {
    refetch()
  }, [companyId, locationId, deviceId, refetch])

  const companies = companyList as Company[]
  const devices = deviceList as Device[]
  const locations = locationList as Location[]

  const rows = useMemo<AlertRow[]>(() => {
    return data.map((alert) => {
      const deviceInfo = devices.find((item) => item.id === alert.deviceId)
      const locationInfo = locations.find(
        (item) => item.id === alert.locationId
      )
      const companyInfo = companies.find(
        (item) => item.id === alert.companyId
      )

      return {
        ...alert,
        deviceName: deviceInfo?.name ?? alert.deviceId,
        locationName: locationInfo?.name ?? "Unknown",
        companyName: companyInfo?.name ?? "Unknown",
      }
    })
  }, [companies, data, devices, locations])

  const filteredRows = useMemo(() => {
    return rows.filter((alert) => {
      if (severityFilter !== "all" && alert.severity !== severityFilter) return false
      if (stateFilter !== "all" && alert.state !== stateFilter) return false
      return true
    })
  }, [rows, severityFilter, stateFilter])

  const selectedAlert = useMemo(
    () => rows.find((alert) => alert.id === selectedAlertId) ?? null,
    [rows, selectedAlertId]
  )

  const columns = useMemo<ColumnDef<AlertRow>[]>(
    () => [
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.severity}
            variant={getSeverityVariant(row.original.severity)}
          />
        ),
      },
      {
        accessorKey: "state",
        header: "State",
        cell: ({ row }) => <Badge variant="secondary">{row.original.state}</Badge>,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="font-medium text-foreground">{row.original.title}</div>
        ),
      },
      {
        accessorKey: "deviceName",
        header: "Device",
      },
      {
        accessorKey: "locationName",
        header: "Location",
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => formatRelativeTime(row.original.updatedAt),
      },
    ],
    []
  )

  const filterControls = (
    <div className="flex items-center gap-2">
      <Select
        value={severityFilter}
        onValueChange={(value) => setSeverityFilter(value as SeverityFilter)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          {severityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={stateFilter}
        onValueChange={(value) => setStateFilter(value as StateFilter)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          {stateOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <PageLayout>
      <PageHeader
        title="Alerts"
        description="Escalations, incidents, and alert routing across the fleet."
      />
      <Section title="Alert queue" description="Active alerts by severity and state.">
        <div className="mb-3">{filterControls}</div>
        {filteredRows.length === 0 && status !== "loading" && !error ? (
          <EmptyState title="No alerts" description="You're all caught up." />
        ) : (
          <DataTable
            title="Alerts"
            description="Filtered by current context and status."
            actions={null}
            columns={columns}
            data={filteredRows}
            isLoading={status === "loading"}
            errorMessage={error}
            emptyMessage="No alerts match filters."
            enableSearch={true}
            searchPlaceholder="Search alerts"
            stickyHeader={true}
            filterFn={(row, query) => {
              const haystack = `${row.title} ${row.description} ${row.deviceName} ${row.locationName}`.toLowerCase()
              return haystack.includes(query)
            }}
            onRowClick={(row) => setSelectedAlertId(row.id)}
          />
        )}
      </Section>

      <Drawer
        open={Boolean(selectedAlertId)}
        onOpenChange={(open) => {
          if (!open) setSelectedAlertId(null)
        }}
      >
        <DrawerContent>
          {selectedAlert ? (
            <div className="flex h-full flex-col gap-6">
              <DrawerHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <DrawerTitle>{selectedAlert.title}</DrawerTitle>
                    <DrawerDescription>{selectedAlert.description}</DrawerDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={
                        selectedAlert.state === "ack" || selectedAlert.state === "resolved"
                      }
                      onClick={() =>
                        dispatch(updateAlertState({ id: selectedAlert.id, state: "ack" }))
                      }
                    >
                      Ack
                    </Button>
                    <Button
                      disabled={selectedAlert.state === "resolved"}
                      onClick={() =>
                        dispatch(updateAlertState({ id: selectedAlert.id, state: "resolved" }))
                      }
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    label={selectedAlert.severity}
                    variant={getSeverityVariant(selectedAlert.severity)}
                  />
                  <Badge variant="secondary">{selectedAlert.state}</Badge>
                </div>
              </DrawerHeader>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    Timeline
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Detected</span>
                      <span>{formatISODate(selectedAlert.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Escalated</span>
                      <span>{formatISODate(selectedAlert.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Latest update</span>
                      <span>{formatISODate(selectedAlert.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    Related
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <div>
                      Device: <Link className="text-foreground hover:underline" to={`/eng/devices/${selectedAlert.deviceId}`}>{selectedAlert.deviceName}</Link>
                    </div>
                    <div>Location: {selectedAlert.locationName}</div>
                    <div>Company: {selectedAlert.companyName}</div>
                  </div>
                </div>
              </div>

              <DrawerFooter>
                <Button variant="outline" onClick={() => setSelectedAlertId(null)}>
                  Close
                </Button>
              </DrawerFooter>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </PageLayout>
  )
}
