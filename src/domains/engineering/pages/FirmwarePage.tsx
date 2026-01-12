import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { useAppSelector } from "@/app/store/hooks"
import { selectHasCapability } from "@/app/store/slices/authSelectors"
import { DataTable } from "@/shared/components/DataTable"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { useFirmware } from "@/shared/hooks/useFirmware"
import type { FirmwareRelease } from "@/shared/mock/domainTypes"
import { formatISODate } from "@/shared/utils/date"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "deprecated", label: "Deprecated" },
] as const

type StatusFilter = (typeof statusOptions)[number]["value"]

const rolloutOptions = [
  { value: "all", label: "All rollouts" },
  { value: "staged", label: "Staged" },
  { value: "global", label: "Global" },
] as const

type RolloutFilter = (typeof rolloutOptions)[number]["value"]

export function FirmwarePage() {
  const canPushFirmware = useAppSelector(selectHasCapability("can_push_firmware"))
  const { data, status, error, refetch } = useFirmware()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [rolloutFilter, setRolloutFilter] = useState<RolloutFilter>("all")

  useEffect(() => {
    refetch()
  }, [refetch])

  const rows = useMemo(() => data ?? [], [data])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      if (rolloutFilter !== "all" && row.rollout !== rolloutFilter) return false
      return true
    })
  }, [rolloutFilter, rows, statusFilter])

  const columns = useMemo<ColumnDef<FirmwareRelease>[]>(
    () => [
      {
        accessorKey: "version",
        header: "Version",
      },
      {
        accessorKey: "releasedAt",
        header: "Released",
        cell: ({ row }) => formatISODate(row.original.releasedAt),
      },
      {
        accessorKey: "rollout",
        header: "Rollout",
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
    ],
    []
  )

  const filterControls = (
    <div className="flex items-center gap-2">
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
      <Select
        value={rolloutFilter}
        onValueChange={(value) => setRolloutFilter(value as RolloutFilter)}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Rollout" />
        </SelectTrigger>
        <SelectContent>
          {rolloutOptions.map((option) => (
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
        title="Firmware"
        description="Firmware rollouts and release notes will be managed here."
        actions={canPushFirmware ? <Button>Upload firmware</Button> : undefined}
      />
      <Section
        title="Firmware releases"
        description="Version history and rollout planning for the fleet."
      >
        <div className="mb-3">{filterControls}</div>
        {filteredRows.length === 0 && status !== "loading" && !error ? (
          <EmptyState
            title="No firmware releases"
            description="Upload a release to populate the firmware directory."
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredRows}
            isLoading={status === "loading"}
            errorMessage={error}
            emptyMessage="No firmware releases available."
            enableSearch={true}
            searchPlaceholder="Search firmware"
            stickyHeader={true}
            filterFn={(row, query) => {
              const haystack = `${row.version} ${row.rollout} ${row.status} ${row.notes}`.toLowerCase()
              return haystack.includes(query)
            }}
            rowActions={
              canPushFirmware
                ? () => (
                    <Button variant="outline" size="sm">
                      Promote
                    </Button>
                  )
                : undefined
            }
          />
        )}
      </Section>
    </PageLayout>
  )
}
