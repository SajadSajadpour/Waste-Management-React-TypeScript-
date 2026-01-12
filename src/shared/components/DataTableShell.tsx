import { type ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { cn } from "@/shared/utils/cn"

type DataTableShellProps = {
  title: string
  description?: string
  actions?: ReactNode
  columns: string[]
  rows: unknown[]
  className?: string
}

export function DataTableShell({
  title,
  description,
  actions,
  columns,
  rows,
  className,
}: DataTableShellProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "rounded-md border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground"
          )}
        >
          <div className="font-medium text-foreground">Table shell</div>
          <div className="mt-2">Columns: {columns.length}</div>
          <div>Rows: {rows.length}</div>
        </div>
      </CardContent>
    </Card>
  )
}
