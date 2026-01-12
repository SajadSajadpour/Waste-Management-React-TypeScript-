import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"

import { routePaths } from "@/app/router/routes"
import { useAppSelector } from "@/app/store/hooks"
import { selectCompanies } from "@/app/store/slices/companiesSelectors"
import { selectDevices } from "@/app/store/slices/devicesSelectors"
import { selectLocations } from "@/app/store/slices/locationsSelectors"
import type { Company, Device, Location } from "@/shared/mock/types"
import deviceStatus from "@/shared/mock/deviceStatus.json"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { ContentCard } from "@/shared/components/ContentCard"

type DeviceStatusEntry = {
  deviceId: string
  status: "online" | "offline" | "maintenance"
}

export function CompanyDetailPage() {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const companies = useAppSelector(selectCompanies) as Company[]
  const locations = useAppSelector(selectLocations) as Location[]
  const devices = useAppSelector(selectDevices) as Device[]
  const statusList = deviceStatus as DeviceStatusEntry[]

  const company = useMemo(
    () => companies.find((item) => item.id === companyId),
    [companies, companyId]
  )

  const companyLocations = useMemo(
    () => locations.filter((location) => location.companyId === companyId),
    [companyId, locations]
  )

  const locationIds = useMemo(
    () => new Set(companyLocations.map((location) => location.id)),
    [companyLocations]
  )

  const companyDevices = useMemo(
    () => devices.filter((device) => locationIds.has(device.locationId)),
    [devices, locationIds]
  )

  const statusById = useMemo(
    () => new Map(statusList.map((entry) => [entry.deviceId, entry.status])),
    [statusList]
  )

  const statusCounts = useMemo(() => {
    if (statusList.length === 0) return null
    const counts = { online: 0, offline: 0, maintenance: 0 }
    companyDevices.forEach((device) => {
      const status = statusById.get(device.id)
      if (!status) return
      counts[status] += 1
    })
    return counts
  }, [companyDevices, statusById, statusList.length])

  const locationDeviceCount = useMemo(() => {
    return companyDevices.reduce<Record<string, number>>((acc, device) => {
      acc[device.locationId] = (acc[device.locationId] ?? 0) + 1
      return acc
    }, {})
  }, [companyDevices])

  const locationColumns = useMemo<ColumnDef<Location>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Location",
      },
      {
        accessorKey: "id",
        header: "Location ID",
      },
      {
        id: "devicesCount",
        header: "Devices",
        cell: ({ row }) => locationDeviceCount[row.original.id] ?? 0,
      },
    ],
    [locationDeviceCount]
  )

  const deviceColumns = useMemo<ColumnDef<Device>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Device",
      },
      {
        accessorKey: "id",
        header: "Device ID",
      },
      {
        accessorKey: "locationId",
        header: "Location ID",
      },
    ],
    []
  )

  if (!companyId || !company) {
    return (
      <PageLayout>
        <PageHeader
          title="Company"
          description="Company not found in the demo dataset."
        />
        <EmptyState
          title="Company not found"
          description="Return to the companies directory to select a valid company."
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        title={company.name}
        description="Company overview and related assets."
      />
      <Section title="Company overview" description="Core account details.">
        <div className="space-y-4">
          <ContentCard>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Company ID</div>
                <div className="text-sm font-medium text-foreground">{company.id}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Region</div>
                <div className="text-sm font-medium text-foreground">North America</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="text-sm font-medium text-foreground">
                  1200 Market Street, Suite 400
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="text-sm font-medium text-foreground">+1 (555) 013-2244</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Primary Contact</div>
                <div className="text-sm font-medium text-foreground">Operations Team</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Contact Email</div>
                <div className="text-sm font-medium text-foreground">
                  ops@foodcycler.demo
                </div>
              </div>
            </div>
          </ContentCard>
          <ContentCard>
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <div className="text-sm text-muted-foreground">Locations</div>
                <div className="text-lg font-semibold text-foreground">
                  {companyLocations.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Devices</div>
                <div className="text-lg font-semibold text-foreground">
                  {companyDevices.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Devices Online</div>
                <div className="text-lg font-semibold text-foreground">
                  {statusCounts ? statusCounts.online : "Unknown"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Devices Offline</div>
                <div className="text-lg font-semibold text-foreground">
                  {statusCounts ? statusCounts.offline : "Unknown"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
                <div className="text-lg font-semibold text-foreground">
                  {statusCounts ? statusCounts.maintenance : "Unknown"}
                </div>
              </div>
            </div>
          </ContentCard>
        </div>
      </Section>
      <Section title="Locations" description="Active locations under this company.">
        {companyLocations.length === 0 ? (
          <EmptyState
            title="No locations"
            description="No locations are registered for this company."
          />
        ) : (
          <DataTable
            columns={locationColumns}
            data={companyLocations}
            enableSearch={true}
            searchPlaceholder="Search locations"
            stickyHeader={true}
            onRowClick={(row) =>
              navigate(
                `${routePaths.business.locations}?companyId=${company.id}&locationId=${row.id}`
              )
            }
          />
        )}
      </Section>
      <Section title="Devices" description="Devices assigned to this company.">
        {companyDevices.length === 0 ? (
          <EmptyState
            title="No devices"
            description="No devices are registered for this company."
          />
        ) : (
          <DataTable
            columns={deviceColumns}
            data={companyDevices}
            enableSearch={true}
            searchPlaceholder="Search devices"
            stickyHeader={true}
            onRowClick={(row) =>
              navigate(routePaths.business.deviceDetail(row.id))
            }
          />
        )}
      </Section>
    </PageLayout>
  )
}
