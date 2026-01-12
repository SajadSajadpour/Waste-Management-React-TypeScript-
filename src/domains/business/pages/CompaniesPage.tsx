import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Building2, Plus } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { addCompany } from "@/app/store/slices/companiesSlice"
import {
  selectCompanies,
  selectCompaniesError,
  selectCompaniesStatus,
} from "@/app/store/slices/companiesSelectors"
import { selectLocations } from "@/app/store/slices/locationsSelectors"
import { selectDevices } from "@/app/store/slices/devicesSelectors"
import { routePaths } from "@/app/router/routes"
import type { Company, Device, Location } from "@/shared/mock/types"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function CompaniesPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCompanies) as Company[]
  const status = useAppSelector(selectCompaniesStatus)
  const error = useAppSelector(selectCompaniesError)
  const locations = useAppSelector(selectLocations) as Location[]
  const devices = useAppSelector(selectDevices) as Device[]
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const hasOpenedOnce = useRef(false)

  useEffect(() => {
    if (isOpen) {
      hasOpenedOnce.current = true
    }
    if (!isOpen && hasOpenedOnce.current) {
      setName("")
    }
  }, [isOpen])

  const locationCountByCompany = useMemo(() => {
    return locations.reduce<Record<string, number>>((acc, location) => {
      acc[location.companyId] = (acc[location.companyId] ?? 0) + 1
      return acc
    }, {})
  }, [locations])

  const deviceCountByCompany = useMemo(() => {
    return devices.reduce<Record<string, number>>((acc, device) => {
      const location = locations.find((item) => item.id === device.locationId)
      if (!location) return acc
      acc[location.companyId] = (acc[location.companyId] ?? 0) + 1
      return acc
    }, {})
  }, [devices, locations])

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Company Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {row.original.name}
          </div>
        ),
      },
      {
        id: "locationsCount",
        header: "Locations",
        cell: ({ row }) => locationCountByCompany[row.original.id] ?? 0,
      },
      {
        id: "devicesCount",
        header: "Devices",
        cell: ({ row }) => deviceCountByCompany[row.original.id] ?? 0,
      },
      {
        id: "contact",
        header: "Primary Contact",
        cell: () => "Operations Team",
      },
      {
        id: "contactInfo",
        header: "Contact Info",
        cell: () => "ops@foodcycler.demo",
      },
      {
        id: "region",
        header: "Region",
        cell: () => "North America",
      },
      {
        accessorKey: "id",
        header: "Company ID",
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
    [deviceCountByCompany, locationCountByCompany]
  )

  const isValid = name.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const slug = slugify(name)
    const baseId = slug ? `comp-${slug}` : `comp-${Date.now()}`
    const id = items.some((company) => company.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId
    dispatch(addCompany({ id, name: name.trim() }))
    setName("")
    setIsOpen(false)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Companies"
        description="Demo dataset stored locally for the dashboard prototype."
        actions={
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Company
          </Button>
        }
      />
      <Section title="Company directory" description="All companies in the demo dataset.">
        {items.length === 0 && status !== "loading" ? (
          <EmptyState title="No companies yet" description="Create the first company to begin." />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            isLoading={status === "loading"}
            errorMessage={error}
            emptyMessage="No companies available."
            enableSearch={true}
            searchPlaceholder="Search companies"
            stickyHeader={true}
            onRowClick={(row) =>
              navigate(routePaths.business.companyDetail(row.id))
            }
          />
        )}
      </Section>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create company</DialogTitle>
            <DialogDescription>
              Add a new company to the demo dataset. This will only update local state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="company-name">
              Company name
            </label>
            <Input
              id="company-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Harborview Foods"
              autoFocus
            />
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
