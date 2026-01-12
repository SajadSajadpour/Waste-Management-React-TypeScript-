import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Cpu, Plus } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectCompanyId, selectLocationId } from "@/app/store/slices/contextSelectors"
import { addDevice } from "@/app/store/slices/devicesSlice"
import {
  selectDevices,
  selectDevicesError,
  selectDevicesStatus,
} from "@/app/store/slices/devicesSelectors"
import { selectLocations } from "@/app/store/slices/locationsSelectors"
import { selectCompanies } from "@/app/store/slices/companiesSelectors"
import { routePaths } from "@/app/router/routes"
import type { Company, Device, Location } from "@/shared/mock/types"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { StatusBadge } from "@/shared/components/StatusBadge"
import deviceStatus from "@/shared/mock/deviceStatus.json"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type CompanyFilter = "all" | string
type LocationFilter = "all" | string
type DeviceStatusEntry = {
  deviceId: string
  status: "online" | "offline" | "maintenance"
}

function getStatusVariant(status?: DeviceStatusEntry["status"]) {
  if (status === "maintenance") return "maintenance"
  if (status === "offline") return "critical"
  if (status === "online") return "online"
  return "info"
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function DevicesPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const contextCompanyId = useAppSelector(selectCompanyId)
  const contextLocationId = useAppSelector(selectLocationId)
  const devices = useAppSelector(selectDevices)
  const status = useAppSelector(selectDevicesStatus)
  const error = useAppSelector(selectDevicesError)
  const locations = useAppSelector(selectLocations)
  const companies = useAppSelector(selectCompanies)
  const statusList = deviceStatus as DeviceStatusEntry[]

  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>(
    contextCompanyId ?? "all"
  )
  const [locationFilter, setLocationFilter] = useState<LocationFilter>(
    contextLocationId ?? "all"
  )
  const [isLocationPinned, setIsLocationPinned] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [locationId, setLocationId] = useState("")
  const hasOpenedOnce = useRef(false)

  useEffect(() => {
    if (isOpen) {
      hasOpenedOnce.current = true
    }
    if (!isOpen && hasOpenedOnce.current) {
      setName("")
      if (!contextLocationId) {
        setLocationId("")
      }
    }
  }, [contextLocationId, isOpen])

  useEffect(() => {
    if (!isLocationPinned) {
      setLocationFilter(contextLocationId ?? "all")
      if (contextLocationId) {
        const contextLocation = locations.find(
          (location) => location.id === contextLocationId
        )
        if (contextLocation?.companyId) {
          setCompanyFilter(contextLocation.companyId)
        }
      } else if (contextCompanyId) {
        setCompanyFilter(contextCompanyId)
      } else {
        setCompanyFilter("all")
      }
    }
  }, [contextCompanyId, contextLocationId, isLocationPinned, locations])

  const companyById = useMemo(() => {
    return new Map(companies.map((company) => [company.id, company]))
  }, [companies])

  const locationById = useMemo(() => {
    return new Map(locations.map((location) => [location.id, location]))
  }, [locations])

  const statusById = useMemo(
    () => new Map(statusList.map((entry) => [entry.deviceId, entry.status])),
    [statusList]
  )

  const filteredLocations = useMemo(() => {
    if (companyFilter === "all") return locations
    return locations.filter((location) => location.companyId === companyFilter)
  }, [companyFilter, locations])

  useEffect(() => {
    const validLocations = companyFilter === "all" ? locations : filteredLocations
    const hasLocation = (id: string) =>
      validLocations.some((location) => location.id === id)

    if (locationFilter !== "all" && !hasLocation(locationFilter)) {
      setLocationFilter("all")
    }

    if (isOpen && locationId && !hasLocation(locationId)) {
      setLocationId("")
    }

    if (locationFilter !== "all") {
      const location = locationById.get(locationFilter)
      if (!location) {
        setLocationFilter("all")
      }
      if (companyFilter !== "all" && location?.companyId !== companyFilter) {
        setLocationFilter("all")
      }
    }
  }, [
    companyFilter,
    filteredLocations,
    locationFilter,
    locationId,
    locationById,
    locations,
    isOpen,
  ])

  const filteredDevices = useMemo(() => {
    let results = devices
    if (companyFilter !== "all") {
      const locationIds = locations
        .filter((location) => location.companyId === companyFilter)
        .map((location) => location.id)
      results = results.filter((device) => locationIds.includes(device.locationId))
    }
    if (locationFilter !== "all") {
      results = results.filter((device) => device.locationId === locationFilter)
    }
    return results
  }, [companyFilter, devices, locationFilter, locations])

  const columns = useMemo<ColumnDef<Device>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Device Name",
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
        accessorKey: "locationId",
        header: "Location",
        cell: ({ row }) => locationById.get(row.original.locationId)?.name ?? "Unknown",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const statusValue = statusById.get(row.original.id)
          return (
            <StatusBadge
              label={statusValue ?? "unknown"}
              variant={getStatusVariant(statusValue)}
            />
          )
        },
      },
      {
        id: "company",
        header: "Company",
        cell: ({ row }) => {
          const location = locationById.get(row.original.locationId)
          return location ? companyById.get(location.companyId)?.name ?? "Unknown" : "Unknown"
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: () => (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled>
              View
            </Button>
            <Button size="sm" variant="ghost" disabled>
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [companyById, locationById, statusById]
  )

  const isValid = name.trim().length > 0 && locationId.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const nameSlug = slugify(name)
    const location = locationById.get(locationId)
    const locationSlug = slugify(location?.name ?? "") || locationId.replace("loc-", "")
    const baseId = nameSlug
      ? `dev-${locationSlug}-${nameSlug}`
      : `dev-${locationSlug}-${Date.now()}`
    const id = devices.some((device) => device.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId
    dispatch(addDevice({ id, name: name.trim(), locationId }))
    setName("")
    setLocationId("")
    setIsOpen(false)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Devices"
        description="Demo dataset stored locally for the dashboard prototype."
        actions={
          <Button
            onClick={() => {
              if (contextLocationId) {
                setLocationId(contextLocationId)
                const contextLocation = locationById.get(contextLocationId)
                if (contextLocation?.companyId) {
                  setCompanyFilter(contextLocation.companyId)
                  setLocationFilter(contextLocation.id)
                  setIsLocationPinned(true)
                }
              } else {
                setLocationId("")
              }
              setIsOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Device
          </Button>
        }
      />
      <Section title="Devices directory" description="All devices in the demo dataset.">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Select
            value={companyFilter}
            onValueChange={(value) => {
              setCompanyFilter(value as CompanyFilter)
              setIsLocationPinned(true)
            }}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Company filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies.map((company: Company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={locationFilter}
            onValueChange={(value) => {
              setLocationFilter(value as LocationFilter)
              setIsLocationPinned(true)
            }}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Location filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {filteredLocations.map((location: Location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filteredDevices.length === 0 && status !== "loading" && !error ? (
          <EmptyState
            title="No devices available"
            description="Adjust filters or add devices to populate the list."
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredDevices}
            isLoading={status === "loading"}
            errorMessage={error}
            emptyMessage="No devices available."
            enableSearch={true}
            searchPlaceholder="Search devices"
            stickyHeader={true}
            onRowClick={(row) =>
              navigate(routePaths.business.deviceDetail(row.id))
            }
          />
        )}
      </Section>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create device</DialogTitle>
            <DialogDescription>
              Add a new device to the demo dataset. This will only update local state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="device-location">
                Location
              </label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="device-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {(companyFilter === "all" ? locations : filteredLocations).map(
                    (location: Location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="device-name">
                Device name
              </label>
              <Input
                id="device-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Harborview FC-120"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
