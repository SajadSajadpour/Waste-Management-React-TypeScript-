import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MapPin } from "lucide-react"

import { useAppSelector } from "@/app/store/hooks"
import { selectCompanyId, selectLocationId } from "@/app/store/slices/contextSelectors"
import {
  selectLocations,
  selectLocationsError,
  selectLocationsStatus,
} from "@/app/store/slices/locationsSelectors"
import { selectCompanies } from "@/app/store/slices/companiesSelectors"
import type { Company, Location } from "@/shared/mock/types"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type CompanyFilter = "all" | string
type LocationFilter = "all" | string

export function LocationsPage() {
  const contextCompanyId = useAppSelector(selectCompanyId)
  const contextLocationId = useAppSelector(selectLocationId)
  const items = useAppSelector(selectLocations) as Location[]
  const status = useAppSelector(selectLocationsStatus)
  const error = useAppSelector(selectLocationsError)
  const companies = useAppSelector(selectCompanies) as Company[]

  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>(
    contextCompanyId ?? "all"
  )
  const [locationFilter, setLocationFilter] = useState<LocationFilter>(
    contextLocationId ?? "all"
  )
  const [isFilterPinned, setIsFilterPinned] = useState(false)

  useEffect(() => {
    if (!isFilterPinned) {
      setLocationFilter(contextLocationId ?? "all")
      if (contextLocationId) {
        const contextLocation = items.find(
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
  }, [contextCompanyId, contextLocationId, isFilterPinned, items])

  const companyById = useMemo(() => {
    return new Map<string, Company>(companies.map((company) => [company.id, company]))
  }, [companies])

  const locationById = useMemo(() => {
    return new Map<string, Location>(items.map((location) => [location.id, location]))
  }, [items])

  const filteredLocations = useMemo(() => {
    if (companyFilter === "all") return items
    return items.filter((location) => location.companyId === companyFilter)
  }, [companyFilter, items])

  useEffect(() => {
    const validLocations = companyFilter === "all" ? items : filteredLocations
    const hasLocation = (id: string) =>
      validLocations.some((location) => location.id === id)

    if (locationFilter !== "all" && !hasLocation(locationFilter)) {
      setLocationFilter("all")
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
  }, [companyFilter, filteredLocations, locationFilter, locationById, items])

  const filteredItems = useMemo(() => {
    let results = items
    if (companyFilter !== "all") {
      results = results.filter((location) => location.companyId === companyFilter)
    }
    if (locationFilter !== "all") {
      results = results.filter((location) => location.id === locationFilter)
    }
    return results
  }, [companyFilter, items, locationFilter])

  const columns = useMemo<ColumnDef<Location>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Location Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium text-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: "Location ID",
      },
      {
        accessorKey: "companyId",
        header: "Company",
        cell: ({ row }) => companyById.get(row.original.companyId)?.name ?? "Unknown",
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
    [companyById]
  )

  return (
    <PageLayout>
      <PageHeader
        title="Locations"
        description="Operational view of locations in the fleet."
      />
      <Section
        title="Locations directory"
        description="Browse operational locations and filter by company or site."
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Select
            value={companyFilter}
            onValueChange={(value) => {
              setCompanyFilter(value as CompanyFilter)
              setIsFilterPinned(true)
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
              setIsFilterPinned(true)
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
        {filteredItems.length === 0 && status !== "loading" && !error ? (
          <EmptyState
            title="No locations"
            description="No operational locations match the selected filters."
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            isLoading={status === "loading"}
            errorMessage={error}
            emptyMessage="No locations available."
            enableSearch={true}
            searchPlaceholder="Search locations"
            stickyHeader={true}
          />
        )}
      </Section>
    </PageLayout>
  )
}
