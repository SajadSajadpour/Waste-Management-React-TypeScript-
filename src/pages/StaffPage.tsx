import { useEffect, useMemo, useRef, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Users } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectCompanyId, selectLocationId } from "@/app/store/slices/contextSelectors"
import { addStaff } from "@/app/store/slices/staffSlice"
import {
  selectStaff,
  selectStaffError,
  selectStaffStatus,
} from "@/app/store/slices/staffSelectors"
import { selectLocations } from "@/app/store/slices/locationsSelectors"
import { selectCompanies } from "@/app/store/slices/companiesSelectors"
import type { Company, Location, Staff } from "@/shared/mock/types"
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
type StaffRole = "Admin" | "Manager" | "Staff"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value)
}

export function StaffPage() {
  const dispatch = useAppDispatch()
  const contextCompanyId = useAppSelector(selectCompanyId)
  const contextLocationId = useAppSelector(selectLocationId)
  const items = useAppSelector(selectStaff)
  const status = useAppSelector(selectStaffStatus)
  const error = useAppSelector(selectStaffError)
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
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<StaffRole>("Staff")
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
      setEmail("")
      setRole("Staff")
      if (!contextLocationId) {
        setLocationId("")
      }
    }
  }, [contextLocationId, isOpen, locationId])

  const companyById = useMemo(() => {
    return new Map<string, Company>(companies.map((company) => [company.id, company]))
  }, [companies])

  const locationById = useMemo(() => {
    return new Map<string, Location>(locations.map((location) => [location.id, location]))
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
      results = results.filter((staff) => locationIds.includes(staff.locationId))
    }
    if (locationFilter !== "all") {
      results = results.filter((staff) => staff.locationId === locationFilter)
    }
    return results
  }, [companyFilter, items, locationFilter, locations])

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
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

  const isValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    isValidEmail(email) &&
    locationId.trim().length > 0 &&
    role.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const nameSlug = slugify(name)
    const location = locationById.get(locationId)
    const locationSlug = slugify(location?.name ?? "") || locationId.replace("loc-", "")
    const baseId = nameSlug
      ? `staff-${locationSlug}-${nameSlug}`
      : `staff-${locationSlug}-${Date.now()}`
    const id = items.some((staff) => staff.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId
    dispatch(
      addStaff({
        id,
        name: name.trim(),
        email: email.trim(),
        role,
        companyId: location?.companyId ?? "",
        locationId,
      })
    )
    setName("")
    setEmail("")
    setRole("Staff")
    setLocationId("")
    setIsOpen(false)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Staff"
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
                  setIsFilterPinned(true)
                }
              } else {
                setLocationId("")
              }
              setIsOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Staff
          </Button>
        }
      />
      <Section title="Staff directory" description="All staff in the demo dataset.">
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
          <EmptyState title="No staff yet" description="Create the first staff record." />
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            isLoading={status === "loading"}
            errorMessage={error}
            emptyMessage="No staff available."
            enableSearch={true}
            searchPlaceholder="Search staff"
            stickyHeader={true}
          />
        )}
      </Section>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create staff</DialogTitle>
            <DialogDescription>
              Add a new staff member to the demo dataset. This will only update local state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="staff-location">
                Location
              </label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="staff-location">
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
              <label className="text-sm font-medium text-foreground" htmlFor="staff-name">
                Full name
              </label>
              <Input
                id="staff-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Harper Blake"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="staff-email">
                Email address
              </label>
              <Input
                id="staff-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="e.g. harper.blake@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="staff-role">
                Role
              </label>
              <Select value={role} onValueChange={(value) => setRole(value as StaffRole)}>
                <SelectTrigger id="staff-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
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
