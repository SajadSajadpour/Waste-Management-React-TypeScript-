import { type ReactNode, useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"

import { useAppSelector } from "@/app/store/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { EmptyState } from "@/shared/components/EmptyState"
import { ErrorState } from "@/shared/components/ErrorState"
import { LoadingState } from "@/shared/components/LoadingState"
import { Input } from "@/shared/ui/input"
import { cn } from "@/shared/utils/cn"

type DataTableProps<TData> = {
  title?: string
  description?: string
  actions?: ReactNode
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  errorMessage?: string | null
  emptyMessage?: string
  onRowClick?: (row: TData) => void
  rowActions?: (row: TData) => ReactNode
  enableSearch?: boolean
  searchPlaceholder?: string
  filterFn?: (row: TData, query: string) => boolean
  stickyHeader?: boolean
  className?: string
}

export function DataTable<TData>({
  title,
  description,
  actions,
  columns,
  data,
  isLoading,
  errorMessage,
  emptyMessage = "No results yet.",
  onRowClick,
  rowActions,
  enableSearch,
  searchPlaceholder = "Search",
  filterFn,
  stickyHeader = false,
  className,
}: DataTableProps<TData>) {
  const tableDensity = useAppSelector((state) => state.ui.tableDensity)
  const [sorting, setSorting] = useState<SortingState>([])
  const [query, setQuery] = useState("")

  const filteredData = useMemo(() => {
    if (!enableSearch || query.trim().length === 0) return data
    const lowerQuery = query.toLowerCase()
    const matcher =
      filterFn ??
      ((row: TData, value: string) =>
        JSON.stringify(row).toLowerCase().includes(value))
    return data.filter((row) => matcher(row, lowerQuery))
  }, [data, enableSearch, filterFn, query])

  const tableColumns = useMemo(() => {
    if (!rowActions) return columns
    return [
      ...columns,
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">{rowActions(row.original)}</div>
        ),
      } as ColumnDef<TData, unknown>,
    ]
  }, [columns, rowActions])

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const rowClass = tableDensity === "compact" ? "h-9" : "h-12"
  const cellClass = tableDensity === "compact" ? "py-1" : "py-2"

  return (
    <Card className={className}>
      {(title || description || actions || enableSearch) && (
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {enableSearch ? (
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full md:w-[220px]"
                aria-label={searchPlaceholder}
              />
            ) : null}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <LoadingState message="Loading table..." />
        ) : errorMessage ? (
          <ErrorState title="Unable to load data" description={errorMessage} />
        ) : filteredData.length === 0 ? (
          <EmptyState title={emptyMessage} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-left text-xs uppercase text-muted-foreground"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          "border-b border-border px-3 pb-2 pt-1",
                          cellClass,
                          stickyHeader && "sticky top-0 bg-card"
                        )}
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            onClick={
                              header.column.getCanSort()
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                            disabled={!header.column.getCanSort()}
                            className={cn(
                              "flex items-center gap-1 text-left text-xs uppercase tracking-wide text-muted-foreground",
                              header.column.getCanSort() && "hover:text-foreground",
                              !header.column.getCanSort() && "cursor-default"
                            )}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() ? (
                              header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : null
                            ) : null}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      rowClass,
                      "border-b border-border text-sm text-foreground transition-colors hover:bg-muted/50",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => {
                      const selection = window.getSelection?.()?.toString()
                      if (selection) return
                      onRowClick?.(row.original)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cn("px-3", cellClass)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
