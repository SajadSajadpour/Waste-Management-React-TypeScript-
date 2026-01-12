import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { MapPin, Plus } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectCompanyId } from "@/app/store/slices/contextSelectors"
import { addLocation } from "@/app/store/slices/locationsSlice"
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function LocationsPage() {
  const dispatch = useAppDispatch()
  const contextCompanyId = useAppSelector(selectCompanyId)
  const items = useAppSelector(selectLocations)
  const status = useAppSelector(selectLocationsStatus)
  const error = useAppSelector(selectLocationsError)
  const companies = useAppSelector(selectCompanies)
  const [filterCompanyId, setFilterCompanyId] = useState<CompanyFilter>(
    contextCompanyId ?? "all"
  )
  const [isFilterPinned, setIsFilterPinned] = useState(false)
  const [searchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [companyId, setCompanyId] = useState("")
  const hasOpenedOnce = useRef(false)

  useEffect(() => {
    if (!isFilterPinned) {
      setFilterCompanyId(contextCompanyId ?? "all")
    }
  }, [contextCompanyId, isFilterPinned])

  const companyParam = searchParams.get("companyId")

  useEffect(() => {
    if (companyParam) {
      setFilterCompanyId(companyParam)
      setIsFilterPinned(true)
    }
  }, [companyParam])

  useEffect(() => {
    if (isOpen) {
      hasOpenedOnce.current = true
      if (contextCompanyId && !companyId) {
        setCompanyId(contextCompanyId)
      }
    }
    if (!isOpen && hasOpenedOnce.current) {
      setName("")
      if (!contextCompanyId) {
        setCompanyId("")
      }
    }
  }, [companyId, contextCompanyId, isOpen])

  useEffect(() => {
    if (!companyId) return
    const exists = companies.some((company) => company.id === companyId)
    if (!exists) {
      setCompanyId("")
    }
  }, [companyId, companies])

  const filteredItems = useMemo(() => {
    if (filterCompanyId === "all") return items
    return items.filter((location) => location.companyId === filterCompanyId)
  }, [filterCompanyId, items])

  const companyById = useMemo(() => {
    return new Map(companies.map((company) => [company.id, company]))
  }, [companies])

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

  const isValid = name.trim().length > 0 && companyId.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const nameSlug = slugify(name)
    const company = companyById.get(companyId)
    const companySlug = slugify(company?.name ?? "") || companyId.replace("comp-", "")
    const baseId = nameSlug
      ? `loc-${companySlug}-${nameSlug}`
      : `loc-${companySlug}-${Date.now()}`
    const id = items.some((location) => location.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId
    dispatch(addLocation({ id, name: name.trim(), companyId }))
    setName("")
    setCompanyId("")
    setIsOpen(false)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Locations"
        description="Demo dataset stored locally for the dashboard prototype."
        actions={
          <Button
            onClick={() => {
              setCompanyId(contextCompanyId ?? "")
              setIsOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Location
          </Button>
        }
      />
      <Section title="Locations directory" description="All locations in the demo dataset.">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Select
            value={filterCompanyId}
            onValueChange={(value) => {
              setFilterCompanyId(value as CompanyFilter)
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
        </div>
        {filteredItems.length === 0 && status !== "loading" ? (
          <EmptyState title="No locations yet" description="Create the first location to begin." />
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create location</DialogTitle>
            <DialogDescription>
              Add a new location to the demo dataset. This will only update local state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-company">
                Company
              </label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger id="location-company">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company: Company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-name">
                Location name
              </label>
              <Input
                id="location-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Harborview East"
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
