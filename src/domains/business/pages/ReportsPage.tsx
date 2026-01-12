import { useEffect, useMemo, useRef, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { FileText, Plus } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectCompanyId, selectLocationId } from "@/app/store/slices/contextSelectors"
import { addReport } from "@/app/store/slices/reportsSlice"
import {
  selectReports,
  selectReportsError,
  selectReportsStatus,
} from "@/app/store/slices/reportsSelectors"
import { selectLocations } from "@/app/store/slices/locationsSelectors"
import { selectCompanies } from "@/app/store/slices/companiesSelectors"
import type { Company, Location, Report } from "@/shared/mock/types"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
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
type ReportType = "Usage" | "Fleet" | "Compliance"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function ReportsPage() {
  const dispatch = useAppDispatch()
  const contextCompanyId = useAppSelector(selectCompanyId)
  const contextLocationId = useAppSelector(selectLocationId)
  const items = useAppSelector(selectReports)
  const status = useAppSelector(selectReportsStatus)
  const error = useAppSelector(selectReportsError)
  const locations = useAppSelector(selectLocations)
  const companies = useAppSelector(selectCompanies)

  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>(
    contextCompanyId ?? "all"
  )
  const [locationFilter, setLocationFilter] = useState<LocationFilter>(
    contextLocationId ?? "all"
  )
  const [isFilterPinned, setIsFilterPinned] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<ReportType>("Usage")
  const [locationId, setLocationId] = useState("")
  const hasOpenedOnce = useRef(false)

  useEffect(() => {
    if (!isFilterPinned) {
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
  }, [contextCompanyId, contextLocationId, isFilterPinned, locations])

  useEffect(() => {
    if (isOpen) {
      hasOpenedOnce.current = true
      if (contextLocationId && !locationId) {
        setLocationId(contextLocationId)
      }
    }
    if (!isOpen && hasOpenedOnce.current) {
      setName("")
      setType("Usage")
      if (!contextLocationId) {
        setLocationId("")
      }
    }
  }, [contextLocationId, isOpen, locationId])

  const companyById = useMemo(() => {
    return new Map(companies.map((company) => [company.id, company]))
  }, [companies])

  const locationById = useMemo(() => {
    return new Map(locations.map((location) => [location.id, location]))
  }, [locations])

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

  const filteredItems = useMemo(() => {
    let results = items
    if (companyFilter !== "all") {
      const locationIds = locations
        .filter((location) => location.companyId === companyFilter)
        .map((location) => location.id)
      results = results.filter((report) => locationIds.includes(report.locationId))
    }
    if (locationFilter !== "all") {
      results = results.filter((report) => report.locationId === locationFilter)
    }
    return results
  }, [companyFilter, items, locationFilter, locations])

  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Report Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium text-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: "Report ID",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "locationId",
        header: "Location",
        cell: ({ row }) => locationById.get(row.original.locationId)?.name ?? "Unknown",
      },
      {
        id: "company",
        header: "Company",
        cell: ({ row }) => {
          const location = locationById.get(row.original.locationId)
          if (location) {
            return companyById.get(location.companyId)?.name ?? "Unknown"
          }
          return companyById.get(row.original.companyId)?.name ?? "Unknown"
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
    [companyById, locationById]
  )

  const isValid = name.trim().length > 0 && locationId.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const nameSlug = slugify(name)
    const location = locationById.get(locationId)
    const locationSlug = slugify(location?.name ?? "") || locationId.replace("loc-", "")
    const baseId = nameSlug
      ? `rep-${locationSlug}-${nameSlug}`
      : `rep-${locationSlug}-${Date.now()}`
    const id = items.some((report) => report.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId
    dispatch(
      addReport({
        id,
        name: name.trim(),
        type,
        companyId: location?.companyId ?? "",
        locationId,
        createdAt: new Date().toISOString(),
      })
    )
    setName("")
    setType("Usage")
    setLocationId("")
    setIsOpen(false)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Reports"
        description="Scheduled exports and performance reports will be configured here."
        actions={
          <Button
            onClick={() => {
              if (contextLocationId) {
                setLocationId(contextLocationId)
                const contextLocation = locationById.get(contextLocationId)
                if (contextLocation?.companyId) {
                  setCompanyFilter(contextLocation.companyId)
                  setLocationFilter(contextLocation.id)
                  setIsFilterPinned(true)
                }
              } else {
                setLocationId("")
              }
              setIsOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate report
          </Button>
        }
      />
      <Section title="Reports directory" description="All reports in the demo dataset.">
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
        {filteredItems.length === 0 && status !== "loading" ? (
          <EmptyState title="No reports yet" description="Generate the first report to begin." />
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            isLoading={status === "loading"}
            errorMessage={error}
            emptyMessage="No reports available."
            enableSearch={true}
            searchPlaceholder="Search reports"
            stickyHeader={true}
          />
        )}
      </Section>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate report</DialogTitle>
            <DialogDescription>
              Create a new report in the demo dataset. This will only update local state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="report-location">
                Location
              </label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="report-location">
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
              <label className="text-sm font-medium text-foreground" htmlFor="report-name">
                Report name
              </label>
              <Input
                id="report-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Monthly Fleet Summary"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="report-type">
                Report type
              </label>
              <Select value={type} onValueChange={(value) => setType(value as ReportType)}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Usage">Usage</SelectItem>
                  <SelectItem value="Fleet">Fleet</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
